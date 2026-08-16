/* state.js - Central application state connected to REST API & Excel Database */
import { api } from './api.js';

const defaultState = {
  user: null,
  audioMuted: false,
  currentRole: 'tier1',
  tierScores: {
    tier1: { scores: {}, average: 0 },
    tier2: { scores: {}, average: 0 },
    tier3: { scores: {}, average: 0 },
    manager: { scores: {}, average: 0 },
    senior: { scores: {}, average: 0 }
  },
  unlockedTiers: {
    tier1: true,
    tier2: false,
    tier3: false,
    manager: false,
    senior: false,
    master: false
  }
};

class StateManager {
  constructor() {
    this.state = JSON.parse(JSON.stringify(defaultState));
  }

  async syncWithServer() {
    const data = await api.getMe();
    if (data && data.user) {
      this.state.user = data.user;
      this.state.currentRole = data.currentRole || 'tier1';
      this.state.tierScores = data.tierScores || defaultState.tierScores;
      this.state.unlockedTiers = data.unlockedTiers || defaultState.unlockedTiers;
      return true;
    }
    this.state.user = null;
    return false;
  }

  async registerUser(userData) {
    const { username, email, experience, organization } = userData;
    const res = await api.register(username, email, experience, organization);
    await this.syncWithServer();
    return res;
  }

  async logout() {
    await api.logout();
    this.state = JSON.parse(JSON.stringify(defaultState));
  }

  acceptTerms() {
    if (this.state.user) {
      this.state.user.acceptedTerms = true;
    }
  }

  toggleAudio() {
    this.state.audioMuted = !this.state.audioMuted;
    return this.state.audioMuted;
  }

  setCurrentRole(role) {
    if (this.isRoleUnlocked(role)) {
      this.state.currentRole = role;
      return true;
    }
    return false;
  }

  isRoleUnlocked(role) {
    if (role === 'tier1') return true;
    return !!this.state.unlockedTiers[role];
  }

  async recordScore(tier, scenarioId, scoreObj) {
    if (!this.state.tierScores[tier]) {
      this.state.tierScores[tier] = { scores: {}, average: 0 };
    }
    
    this.state.tierScores[tier].scores[scenarioId] = scoreObj;
    
    const res = await api.saveScore(tier, scenarioId, scoreObj.total, scoreObj.breakdown);
    await this.syncWithServer();

    return { 
      average: this.state.tierScores[tier].average, 
      newlyUnlocked: res.newlyUnlocked || [] 
    };
  }

  getOverallScore() {
    const averages = Object.values(this.state.tierScores)
      .map(t => t.average)
      .filter(avg => avg > 0);
    if (averages.length === 0) return 0;
    return Math.round(averages.reduce((a, b) => a + b, 0) / averages.length);
  }
}

export const stateManager = new StateManager();
