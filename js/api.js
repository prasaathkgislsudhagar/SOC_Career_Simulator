/* api.js - Frontend HTTP REST API Client for Server Database Communication */

const TOKEN_KEY = 'soc_platform_session_token';

class APIClient {
  constructor() {
    this.token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await res.json().catch(() => ({ error: 'Network response was not valid JSON' }));
      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      return data;
    } catch (e) {
      console.error(`API Error on ${endpoint}:`, e);
      throw e;
    }
  }

  async register(username, email, experience, organization) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, experience, organization })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    if (!this.token) return null;
    try {
      return await this.request('/api/me', { method: 'GET' });
    } catch (e) {
      this.setToken(null);
      return null;
    }
  }

  async saveScore(tier, scenarioId, totalScore, breakdown) {
    return await this.request('/api/score', {
      method: 'POST',
      body: JSON.stringify({ tier, scenarioId, totalScore, breakdown })
    });
  }

  async logout() {
    if (this.token) {
      try {
        await this.request('/api/logout', { method: 'POST' });
      } catch (e) {}
      this.setToken(null);
    }
  }
}

export const api = new APIClient();
