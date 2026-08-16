/* tier2View.js - Tier 2 Analyst Attack Chain Builder Workspace */
import { TIER2_SCENARIOS } from '../data/tier2Scenarios.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderTier2View(container, onScenarioCompleted) {
  let selectedScenarioIndex = 0;
  let assignments = {}; // { stageId: logId }
  let activeStageId = null;

  function render() {
    const sc = TIER2_SCENARIOS[selectedScenarioIndex];
    const pastScores = stateManager.state.tierScores.tier2.scores[sc.id];

    container.innerHTML = `
      <div class="fade-in" style="width: 100%;">
        <!-- Header -->
        <div class="workspace-header">
          <div class="scenario-title-box">
            <h2>
              <span class="badge badge-cyan">TIER 2 ANALYST</span>
              <span>${sc.title}</span>
            </h2>
            <div class="scenario-meta">
              <span>Category: <strong>${sc.category}</strong></span>
              <span>Severity: <strong style="color: var(--accent-red);">${sc.severity}</strong></span>
              ${pastScores ? `<span class="score-pill">Previous Score: ${pastScores.total}/100</span>` : ''}
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            ${TIER2_SCENARIOS.map((s, idx) => `
              <button 
                class="btn ${idx === selectedScenarioIndex ? 'btn-primary' : 'btn-outline'} btn-sm"
                data-idx="${idx}"
              >
                ${s.title.substring(0, 22)}...
              </button>
            `).join('')}
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px; background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2);">
          <div style="font-size: 0.88rem; color: var(--text-main);">
            <strong>🔗 Objective:</strong> ${sc.summary} Click an <strong>Attack Stage Card</strong> to select it, then click the matching <strong>Evidence Log</strong> below to connect the attack chain.
          </div>
        </div>

        <!-- Attack Chain Builder Layout -->
        <div class="attack-chain-layout">
          
          <!-- Stage Slots -->
          <div class="stage-builder-grid">
            ${sc.stages.map((st, idx) => {
              const assignedLogId = assignments[st.id];
              const logObj = sc.logsPool.find(l => l.id === assignedLogId);
              return `
                <div 
                  class="attack-stage-card ${activeStageId === st.id ? 'matched' : ''}" 
                  data-stage-id="${st.id}"
                >
                  <div>
                    <span class="badge badge-cyan" style="margin-bottom: 6px; display: inline-block;">STAGE ${idx + 1}</span>
                    <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main);">${st.name}</h3>
                  </div>

                  <div style="margin: 12px 0; padding: 10px; background: var(--bg-dark); border-radius: var(--radius-sm); border: 1px dashed var(--border-glow); min-height: 60px;">
                    ${logObj ? `
                      <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--accent-green); display: block;">
                        ✓ ${logObj.text}
                      </span>
                    ` : `
                      <span style="font-size: 0.8rem; color: var(--text-dim); text-align: center; display: block;">
                        ${activeStageId === st.id ? '👉 Select evidence below...' : 'Click card to assign evidence'}
                      </span>
                    `}
                  </div>

                  ${logObj ? `
                    <button class="btn btn-outline btn-sm btn-clear-stage" data-stage-id="${st.id}">Clear Stage</button>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Evidence Log Pool -->
          <div class="evidence-pool">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
              📦 Evidence Log Pool (Click to assign to active stage)
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${sc.logsPool.map(log => {
                const isAssigned = Object.values(assignments).includes(log.id);
                return `
                  <div 
                    class="evidence-chip ${isAssigned ? 'assigned' : ''}" 
                    data-log-id="${log.id}"
                  >
                    ${log.text}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Incident Correlation Synthesis Form -->
          <div class="card" style="margin-top: 10px;">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
              🧠 Final Attack Chain Correlation Synthesis
            </h3>
            <div class="form-group">
              <label class="form-label">${sc.fullReportQuestion}</label>
              <select id="t2-report-select" class="form-control">
                <option value="">-- Select Synthesized Attack Narrative --</option>
                ${sc.optionsReport.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
              </select>
            </div>

            <button id="btn-submit-t2" class="btn btn-success btn-lg" style="width: 100%;">
              <span>🔗 Verify & Submit Attack Chain Score</span>
            </button>
          </div>

        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('button[data-idx]').forEach(b => {
      b.addEventListener('click', () => {
        selectedScenarioIndex = parseInt(b.getAttribute('data-idx'));
        assignments = {};
        activeStageId = null;
        soundFx.playClick();
        render();
      });
    });

    container.querySelectorAll('.attack-stage-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-clear-stage')) return;
        activeStageId = card.getAttribute('data-stage-id');
        soundFx.playClick();
        render();
      });
    });

    container.querySelectorAll('.btn-clear-stage').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stId = btn.getAttribute('data-stage-id');
        delete assignments[stId];
        soundFx.playClick();
        render();
      });
    });

    container.querySelectorAll('.evidence-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const logId = chip.getAttribute('data-log-id');
        if (!activeStageId) {
          soundFx.playError();
          alert('Please click an Attack Stage Card above first to choose where to place this evidence!');
          return;
        }
        assignments[activeStageId] = logId;
        soundFx.playSuccess();
        activeStageId = null;
        render();
      });
    });

    container.querySelector('#btn-submit-t2').addEventListener('click', () => {
      evaluateTier2(sc);
    });
  }

  function evaluateTier2(sc) {
    let stageMatchCount = 0;
    sc.stages.forEach(st => {
      const assignedLogId = assignments[st.id];
      if (assignedLogId) {
        const logObj = sc.logsPool.find(l => l.id === assignedLogId);
        if (logObj && logObj.stageMatch === st.id) {
          stageMatchCount++;
        }
      }
    });

    const reportSelect = container.querySelector('#t2-report-select').value;
    const isReportCorrect = reportSelect === sc.correctReport;

    const chainScore = Math.round((stageMatchCount / sc.stages.length) * 70);
    const synthesisScore = isReportCorrect ? 30 : 0;
    const totalScore = chainScore + synthesisScore;

    const result = stateManager.recordScore('tier2', sc.id, {
      total: totalScore,
      breakdown: { chainScore, synthesisScore }
    });

    soundFx.playSuccess();
    showTier2ResultModal(sc, totalScore, stageMatchCount, sc.stages.length, isReportCorrect, result.newlyUnlocked, () => {
      render();
      if (onScenarioCompleted) onScenarioCompleted();
    });
  }

  render();
}

function showTier2ResultModal(sc, totalScore, matched, totalStages, isReportCorrect, newlyUnlocked, onClose) {
  let backdrop = document.querySelector('#t2-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 't2-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 600px; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">${totalScore >= 75 ? '🔗' : '⚠️'}</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">
        Attack Chain Score: <span style="color: ${totalScore >= 75 ? 'var(--accent-cyan)' : 'var(--accent-amber)'}">${totalScore}/100</span>
      </h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
        Incident: <strong>${sc.title}</strong>
      </p>

      ${newlyUnlocked.length > 0 ? `
        <div class="unlock-celebration pulse-cyan" style="background: rgba(0, 243, 255, 0.1); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); margin: 16px 0; padding: 16px;">
          <div style="font-size: 2rem;">🎉 UNLOCKED NEW ROLE!</div>
          <h3 style="color: var(--accent-cyan); font-size: 1.2rem;">${newlyUnlocked.join(', ')}</h3>
        </div>
      ` : ''}

      <div style="margin: 20px 0; background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px; text-align: left;">
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.86rem;">
          <div style="display: flex; justify-content: space-between;">
            <span>Stage-Evidence Correlation (${matched}/${totalStages} Stages Correct)</span>
            <strong style="color: var(--accent-cyan);">${Math.round((matched/totalStages)*70)}/70</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Final Attack Narrative Synthesis</span>
            <strong style="color: ${isReportCorrect ? 'var(--accent-green)' : 'var(--accent-red)'};">
              ${isReportCorrect ? '30/30 (Correct)' : '0/30 (Incorrect)'}
            </strong>
          </div>
        </div>
      </div>

      <button id="btn-close-t2" class="btn btn-primary btn-lg" style="width: 100%;">
        <span>Continue Tier 2 Investigations</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.querySelector('#btn-close-t2').addEventListener('click', () => {
    backdrop.classList.remove('active');
    if (onClose) onClose();
  });
}
