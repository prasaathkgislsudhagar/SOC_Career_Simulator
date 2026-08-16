/* managerView.js - Tier 4 SOC Manager Command Workspace */
import { MANAGER_SCENARIOS } from '../data/managerScenarios.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderManagerView(container, onScenarioCompleted) {
  let selectedScenarioIndex = 0;
  let incidentAssignments = {}; // { incidentId: analystId }
  let reportDecisions = {}; // { reportId: 'APPROVE' | 'REJECT' }
  let escalationChoice = null;

  function render() {
    const sc = MANAGER_SCENARIOS[selectedScenarioIndex];
    const pastScores = stateManager.state.tierScores.manager.scores[sc.id];

    container.innerHTML = `
      <div class="fade-in" style="width: 100%;">
        <!-- Header -->
        <div class="workspace-header">
          <div class="scenario-title-box">
            <h2>
              <span class="badge badge-amber">SOC MANAGER</span>
              <span>${sc.title}</span>
            </h2>
            <div class="scenario-meta">
              <span>Shift Operations & Incident Coordination</span>
              ${pastScores ? `<span class="score-pill">Previous Score: ${pastScores.total}/100</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Live Operations Metrics Banner -->
        <div class="metrics-banner">
          <div class="metric-card">
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">Mean Time to Detect (MTTD)</div>
            <div class="metric-value" style="color: var(--accent-green);">4.2 Mins</div>
          </div>
          <div class="metric-card">
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">Mean Time to Respond (MTTR)</div>
            <div class="metric-value" style="color: var(--accent-cyan);">18.5 Mins</div>
          </div>
          <div class="metric-card">
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">Active Shift Roster</div>
            <div class="metric-value" style="color: var(--accent-amber);">3 Analysts</div>
          </div>
          <div class="metric-card">
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">SLA Compliance Rate</div>
            <div class="metric-value" style="color: var(--accent-purple);">96.4%</div>
          </div>
        </div>

        <div class="manager-grid">
          
          <!-- Column 1: Analyst Dispatch & Triage Desk -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Analyst Roster Card -->
            <div class="card">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 14px;">
                👥 SOC Shift Analyst Roster & Workload
              </h3>
              ${sc.analysts.map(ana => `
                <div class="analyst-card">
                  <div>
                    <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-main);">${ana.name}</h4>
                    <span class="badge badge-cyan" style="font-size: 0.72rem;">${ana.role}</span>
                    <span style="font-size: 0.78rem; color: var(--text-dim); display: block; margin-top: 2px;">Skill: ${ana.skill}</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Workload</span>
                    <strong style="color: ${ana.workloadPct > 80 ? 'var(--accent-red)' : 'var(--accent-green)'}; display: block;">${ana.workloadPct}% Capacity</strong>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Incident Ticket Tasking -->
            <div class="card">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 14px;">
                📥 Task Incoming Incident Queue to Analysts
              </h3>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${sc.incomingIncidents.map(inc => `
                  <div style="background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-sm); padding: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">${inc.title}</h4>
                      <span class="badge ${inc.severity === 'CRITICAL' ? 'badge-red' : 'badge-amber'}">${inc.severity}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 0.78rem; color: var(--text-dim);">Recommended: ${inc.reqTier}</span>
                      <select class="form-control inc-assign-select" data-incid="${inc.id}" style="padding: 4px 8px; font-size: 0.8rem; max-width: 160px;">
                        <option value="">-- Assign --</option>
                        ${sc.analysts.map(a => `
                          <option value="${a.id}" ${incidentAssignments[inc.id] === a.id ? 'selected' : ''}>${a.name}</option>
                        `).join('')}
                      </select>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Column 2: Analyst Report Review & Executive Escalation -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Report Review Panel -->
            <div class="card">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-green); margin-bottom: 14px;">
                📋 Review & Approve Analyst Reports
              </h3>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                ${sc.reportsToReview.map(rep => `
                  <div style="background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-sm); padding: 14px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <strong style="font-size: 0.88rem; color: var(--text-main);">${rep.incidentTitle}</strong>
                      <span class="badge badge-cyan">${rep.analystName}</span>
                    </div>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">
                      <em>"${rep.finding}"</em>
                    </p>
                    <div style="display: flex; gap: 10px;">
                      <button 
                        class="btn ${reportDecisions[rep.id] === 'APPROVE' ? 'btn-success' : 'btn-outline'} btn-sm btn-rep-dec" 
                        data-repid="${rep.id}" 
                        data-dec="APPROVE"
                      >
                        ✓ Approve Report
                      </button>
                      <button 
                        class="btn ${reportDecisions[rep.id] === 'REJECT' ? 'btn-danger' : 'btn-outline'} btn-sm btn-rep-dec" 
                        data-repid="${rep.id}" 
                        data-dec="REJECT"
                      >
                        ✗ Reject & Correct
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Escalation Directive -->
            <div class="card">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-red); margin-bottom: 14px;">
                ⚡ Major Incident Containment Directive
              </h3>
              <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 10px;">
                ${sc.escalationDecisions[0].issue}
              </p>
              <select id="mgr-esc-select" class="form-control" style="font-size: 0.82rem;">
                <option value="">-- Authorize Manager Directive --</option>
                ${sc.escalationDecisions[0].options.map(opt => `
                  <option value="${opt}" ${escalationChoice === opt ? 'selected' : ''}>${opt}</option>
                `).join('')}
              </select>
            </div>

            <button id="btn-submit-mgr" class="btn btn-primary btn-lg" style="margin-top: 10px;">
              <span>🟠 Evaluate Manager Operations Score</span>
            </button>

          </div>

        </div>
      </div>
    `;

    // Listeners
    container.querySelectorAll('.inc-assign-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const incId = sel.getAttribute('data-incid');
        incidentAssignments[incId] = sel.value;
        soundFx.playClick();
      });
    });

    container.querySelectorAll('.btn-rep-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const repId = btn.getAttribute('data-repid');
        const dec = btn.getAttribute('data-dec');
        reportDecisions[repId] = dec;
        soundFx.playClick();
        render();
      });
    });

    const escSel = container.querySelector('#mgr-esc-select');
    if (escSel) {
      escSel.addEventListener('change', () => {
        escalationChoice = escSel.value;
        soundFx.playClick();
      });
    }

    container.querySelector('#btn-submit-mgr').addEventListener('click', () => {
      evaluateManager(sc);
    });
  }

  function evaluateManager(sc) {
    let taskingScore = 0;
    sc.incomingIncidents.forEach(inc => {
      if (incidentAssignments[inc.id] === inc.optimalAssignee) taskingScore += 15;
    });

    let reviewScore = 0;
    sc.reportsToReview.forEach(rep => {
      const dec = reportDecisions[rep.id];
      if (rep.isCorrect && dec === 'APPROVE') reviewScore += 20;
      if (!rep.isCorrect && dec === 'REJECT') reviewScore += 20;
    });

    let escScore = (escalationChoice === sc.escalationDecisions[0].correct) ? 15 : 0;

    const totalScore = Math.min(100, taskingScore + reviewScore + escScore);

    const result = stateManager.recordScore('manager', sc.id, {
      total: totalScore,
      breakdown: { taskingScore, reviewScore, escScore }
    });

    soundFx.playSuccess();
    showManagerResultModal(sc, totalScore, result.newlyUnlocked, () => {
      render();
      if (onScenarioCompleted) onScenarioCompleted();
    });
  }

  render();
}

function showManagerResultModal(sc, score, newlyUnlocked, onClose) {
  let backdrop = document.querySelector('#mgr-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mgr-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 600px; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">${score >= 80 ? '🟠' : '⚠️'}</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">
        SOC Manager Score: <span style="color: ${score >= 80 ? 'var(--accent-amber)' : 'var(--accent-red)'}">${score}/100</span>
      </h2>

      ${newlyUnlocked.length > 0 ? `
        <div class="unlock-celebration pulse-cyan" style="background: rgba(245, 158, 11, 0.15); border: 1px solid var(--accent-amber); border-radius: var(--radius-md); margin: 16px 0; padding: 16px;">
          <div style="font-size: 2rem;">🎉 UNLOCKED HIGHEST TIER!</div>
          <h3 style="color: var(--accent-amber); font-size: 1.2rem;">${newlyUnlocked.join(', ')}</h3>
          <p style="font-size: 0.8rem; color: var(--text-main);">You have unlocked Enterprise Strategic Crisis Command!</p>
        </div>
      ` : ''}

      <div style="margin: 20px 0; background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px; text-align: left; font-size: 0.85rem;">
        Overall shift operational efficiency, ticket tasking alignment, and report review accuracy evaluated.
      </div>

      <button id="btn-close-mgr" class="btn btn-primary btn-lg" style="width: 100%;">
        <span>Continue Manager Operations</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.querySelector('#btn-close-mgr').addEventListener('click', () => {
    backdrop.classList.remove('active');
    if (onClose) onClose();
  });
}
