/* seniorView.js - Tier 5 Senior SOC Manager War Room Controller */
import { SENIOR_SCENARIOS } from '../data/seniorScenarios.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderSeniorView(container, onScenarioCompleted) {
  let selectedScenarioIndex = 0;
  let decisionChoices = {}; // { decId: option }

  function render() {
    const sc = SENIOR_SCENARIOS[selectedScenarioIndex];
    const pastScores = stateManager.state.tierScores.senior.scores[sc.id];

    container.innerHTML = `
      <div class="fade-in" style="width: 100%;">
        <!-- Header -->
        <div class="workspace-header" style="border-color: var(--accent-red); background: rgba(239, 68, 68, 0.05);">
          <div class="scenario-title-box">
            <h2>
              <span class="badge badge-red">SENIOR SOC MANAGER</span>
              <span>${sc.title}</span>
            </h2>
            <div class="scenario-meta">
              <span>Enterprise Strategic Crisis Command War Room</span>
              ${pastScores ? `<span class="score-pill">Previous Score: ${pastScores.total}/100</span>` : ''}
            </div>
          </div>
        </div>

        <!-- War Room Crisis Console -->
        <div class="war-room-panel" style="margin-bottom: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--accent-red); display: flex; align-items: center; justify-content: space-between;">
            <span>🚨 ENTERPRISE CRISIS THREAT RADAR</span>
            <span class="badge badge-red pulse-cyan">LEVEL 1 DEFCON EMERGENCY</span>
          </h3>

          <div class="crisis-threat-list">
            ${sc.threatVectors.map(threat => `
              <div class="crisis-item">
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${threat.title}</h4>
                  <span style="font-size: 0.82rem; color: var(--text-muted);">Target System: ${threat.target}</span>
                </div>
                <span class="badge badge-red">Impact: ${threat.impact}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Strategic Decision Matrix -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 16px;">
            ⚖️ Executive Decision Directives Matrix
          </h3>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${sc.decisionMatrix.map(d => `
              <div style="background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px;">
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
                  ${d.stage}
                </h4>
                <p style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 12px;">
                  ${d.question}
                </p>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${d.options.map(opt => `
                    <label 
                      style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-sm); background: var(--bg-dark); border: 1px solid ${decisionChoices[d.id] === opt ? 'var(--accent-red)' : 'var(--border-dim)'}; cursor: pointer;"
                    >
                      <input 
                        type="radio" 
                        name="dec-${d.id}" 
                        value="${opt}" 
                        ${decisionChoices[d.id] === opt ? 'checked' : ''} 
                        class="dec-radio"
                        data-decid="${d.id}"
                      />
                      <span style="font-size: 0.85rem; color: var(--text-main);">${opt}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <button id="btn-submit-senior" class="btn btn-danger btn-lg" style="width: 100%;">
          <span>🔴 Issue Strategic Directives & Execute Crisis Plan</span>
        </button>

      </div>
    `;

    // Listeners
    container.querySelectorAll('.dec-radio').forEach(r => {
      r.addEventListener('change', () => {
        const decId = r.getAttribute('data-decid');
        decisionChoices[decId] = r.value;
        soundFx.playClick();
        render();
      });
    });

    container.querySelector('#btn-submit-senior').addEventListener('click', () => {
      evaluateSenior(sc);
    });
  }

  function evaluateSenior(sc) {
    let correctCount = 0;
    sc.decisionMatrix.forEach(d => {
      if (decisionChoices[d.id] === d.correct) correctCount++;
    });

    const totalDec = sc.decisionMatrix.length;
    const score = Math.round((correctCount / totalDec) * 100);

    const result = stateManager.recordScore('senior', sc.id, {
      total: score,
      breakdown: { correctCount, totalDec }
    });

    soundFx.playSuccess();
    showSeniorResultModal(sc, score, result.newlyUnlocked, () => {
      render();
      if (onScenarioCompleted) onScenarioCompleted();
    });
  }

  render();
}

function showSeniorResultModal(sc, score, newlyUnlocked, onClose) {
  let backdrop = document.querySelector('#senior-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'senior-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 640px; text-align: center; border-color: var(--accent-red);">
      <div style="font-size: 3rem; margin-bottom: 8px;">${score >= 85 ? '🏆' : '⚠️'}</div>
      <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">
        Strategic Crisis Score: <span style="color: ${score >= 85 ? 'var(--master-color)' : 'var(--accent-red)'}">${score}/100</span>
      </h2>

      ${newlyUnlocked.includes('SOC Master') || stateManager.state.unlockedTiers.master ? `
        <div class="unlock-celebration pulse-cyan" style="background: rgba(255, 215, 0, 0.15); border: 2px solid var(--master-color); border-radius: var(--radius-lg); margin: 20px 0; padding: 20px;">
          <div style="font-size: 3.5rem;">👑</div>
          <h3 style="color: var(--master-color); font-size: 1.5rem; font-weight: 900;">ULTIMATE SOC MASTER ACHIEVED!</h3>
          <p style="font-size: 0.9rem; color: var(--text-main); margin-top: 6px;">
            You have successfully guided the enterprise through critical crises and mastered every operational tier in the SOC career path!
          </p>
        </div>
      ` : ''}

      <div style="margin: 20px 0; background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px; text-align: left; font-size: 0.86rem;">
        Evaluated executive decision framework, crisis containment directives, and regulatory disclosure alignment.
      </div>

      <button id="btn-close-senior" class="btn btn-primary btn-lg" style="width: 100%;">
        <span>Return to SOC Command Headquarters</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.querySelector('#btn-close-senior').addEventListener('click', () => {
    backdrop.classList.remove('active');
    if (onClose) onClose();
  });
}
