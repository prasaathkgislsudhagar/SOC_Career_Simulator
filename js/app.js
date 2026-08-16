/* app.js - Main Application Orchestrator & Router with Backend Sync */
import { stateManager } from './state.js';
import { soundFx } from './audio.js';
import { renderAuthView } from './views/authView.js';
import { renderRulesModal } from './views/rulesView.js';
import { renderCareerPathView } from './views/careerPathView.js';
import { renderTier1View } from './views/tier1View.js';
import { renderTier2View } from './views/tier2View.js';
import { renderTier3View } from './views/tier3View.js';
import { renderManagerView } from './views/managerView.js';
import { renderSeniorView } from './views/seniorView.js';

class Application {
  constructor() {
    this.container = document.querySelector('#app-content');
    this.navStatus = document.querySelector('#user-nav-status');
    this.activeView = 'path'; // 'path', 'tier1', 'tier2', 'tier3', 'tierManager', 'tierSenior'
  }

  async init() {
    await stateManager.syncWithServer();
    this.updateHeaderNav();
    this.route();

    // Global Logo Click Listener
    document.querySelector('#nav-logo').addEventListener('click', () => {
      soundFx.playClick();
      if (stateManager.state.user && stateManager.state.user.acceptedTerms) {
        this.activeView = 'path';
        this.route();
      }
    });
  }

  updateHeaderNav() {
    const user = stateManager.state.user;
    const overallScore = stateManager.getOverallScore();
    const muted = stateManager.state.audioMuted;
    const currentRole = stateManager.state.currentRole;

    if (!user) {
      this.navStatus.innerHTML = `
        <button class="nav-btn" id="btn-audio-toggle">
          ${muted ? '🔇 Muted' : '🔊 Sound On'}
        </button>
      `;
    } else {
      let rolePillClass = 'tier-1';
      let roleLabel = 'Tier 1 Analyst';
      if (currentRole === 'tier2') { rolePillClass = 'tier-2'; roleLabel = 'Tier 2 Analyst'; }
      if (currentRole === 'tier3') { rolePillClass = 'tier-3'; roleLabel = 'Tier 3 Analyst'; }
      if (currentRole === 'tierManager') { rolePillClass = 'tier-manager'; roleLabel = 'SOC Manager'; }
      if (currentRole === 'tierSenior') { rolePillClass = 'tier-senior'; roleLabel = 'Senior SOC Manager'; }
      if (stateManager.state.unlockedTiers.master) { rolePillClass = 'tier-master'; roleLabel = 'SOC Master 🏆'; }

      this.navStatus.innerHTML = `
        <div class="user-profile-badge">
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <span style="font-weight: 700;">${user.username}</span>
          <span class="tier-pill ${rolePillClass}">${roleLabel}</span>
          <span class="score-pill">Overall Score: ${overallScore}%</span>
        </div>

        <button class="nav-btn" id="btn-career-path" title="Career Hierarchy Tree">
          🌳 Career Map
        </button>

        <button class="nav-btn" id="btn-audio-toggle">
          ${muted ? '🔇' : '🔊'}
        </button>

        <button class="nav-btn" id="btn-logout" style="color: var(--accent-red);" title="Sign Out">
          🚪 Logout
        </button>
      `;
    }

    // Bind nav buttons
    const btnAudio = this.navStatus.querySelector('#btn-audio-toggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = stateManager.toggleAudio();
        soundFx.playClick();
        this.updateHeaderNav();
      });
    }

    const btnCareer = this.navStatus.querySelector('#btn-career-path');
    if (btnCareer) {
      btnCareer.addEventListener('click', () => {
        soundFx.playClick();
        this.activeView = 'path';
        this.route();
      });
    }

    const btnLogout = this.navStatus.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        soundFx.playClick();
        await stateManager.logout();
        this.activeView = 'path';
        this.updateHeaderNav();
        this.route();
      });
    }
  }

  route() {
    this.updateHeaderNav();
    const user = stateManager.state.user;

    // Step 1: User Profile Creation & Auto-Authentication
    if (!user) {
      renderAuthView(this.container, () => {
        this.route();
      });
      return;
    }

    // Step 2: Terms Agreement Modal
    if (!user.acceptedTerms) {
      renderRulesModal(() => {
        this.route();
      });
      return;
    }

    // Step 3: Render Active View
    if (this.activeView === 'path') {
      renderCareerPathView(this.container, (selectedRole) => {
        this.activeView = selectedRole;
        this.route();
      });
    } else if (this.activeView === 'tier1') {
      renderTier1View(this.container, () => {
        this.updateHeaderNav();
      });
    } else if (this.activeView === 'tier2') {
      renderTier2View(this.container, () => {
        this.updateHeaderNav();
      });
    } else if (this.activeView === 'tier3') {
      renderTier3View(this.container, () => {
        this.updateHeaderNav();
      });
    } else if (this.activeView === 'tierManager') {
      renderManagerView(this.container, () => {
        this.updateHeaderNav();
      });
    } else if (this.activeView === 'tierSenior') {
      renderSeniorView(this.container, () => {
        this.updateHeaderNav();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
