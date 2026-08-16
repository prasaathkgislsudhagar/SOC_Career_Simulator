/* tier1View.js - Tier 1 Analyst SIEM & Triage Workspace */
import { TIER1_SCENARIOS } from '../data/tier1Scenarios.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderTier1View(container, onScenarioCompleted) {
  let selectedScenarioIndex = 0;
  let selectedLogId = null;

  function render() {
    const sc = TIER1_SCENARIOS[selectedScenarioIndex];
    const pastScores = stateManager.state.tierScores.tier1.scores[sc.id];

    container.innerHTML = `
      <div class="fade-in" style="width: 100%;">
        <!-- Header -->
        <div class="workspace-header">
          <div class="scenario-title-box">
            <h2>
              <span class="badge badge-green">TIER 1 ANALYST</span>
              <span>${sc.title}</span>
            </h2>
            <div class="scenario-meta">
              <span>Category: <strong>${sc.category}</strong></span>
              <span>Severity: <strong style="color: var(--accent-red);">${sc.severity}</strong></span>
              <span>SLA Target: <strong>${sc.slaMinutes} Mins</strong></span>
              ${pastScores ? `<span class="score-pill">Previous Score: ${pastScores.total}/100</span>` : ''}
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            ${TIER1_SCENARIOS.map((s, idx) => `
              <button 
                class="btn ${idx === selectedScenarioIndex ? 'btn-primary' : 'btn-outline'} btn-sm"
                data-idx="${idx}"
              >
                Task ${idx + 1}: ${s.category}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Summary & First Round Guided Helper Banner -->
        <div class="card" style="margin-bottom: 20px; background: rgba(0, 243, 255, 0.04); border-color: rgba(0, 243, 255, 0.2);">
          <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 8px;">
            <strong>📌 Alert Summary:</strong> ${sc.summary}
          </div>
          
          <!-- Guided Copy-Paste Helper -->
          <div style="background: rgba(0, 255, 136, 0.08); border: 1px dashed var(--accent-green); border-radius: var(--radius-sm); padding: 12px; margin-top: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-green);">
                💡 Guided Triage Helper (Click any button below to auto-fill form field):
              </span>
              <span class="badge badge-green">BEGINNER HINT SYSTEM</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-src-ip" data-val="${sc.correctAnswers.srcIP}">
                📋 Fill Source IP: <strong>${sc.correctAnswers.srcIP}</strong>
              </button>
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-user" data-val="${sc.correctAnswers.targetUser}">
                📋 Fill Target User: <strong>${sc.correctAnswers.targetUser}</strong>
              </button>
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-alert-type" data-val="${sc.correctAnswers.alertType}">
                📋 Fill Alert Type: <strong>${sc.correctAnswers.alertType}</strong>
              </button>
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-mitre" data-val-contains="${sc.correctAnswers.mitreID}">
                📋 Fill MITRE: <strong>${sc.correctAnswers.mitreID}</strong>
              </button>
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-containment" data-val="${sc.correctAnswers.containment}">
                📋 Fill Containment Action
              </button>
              <button class="btn btn-outline btn-sm hint-fill-btn" data-field="rep-summary" data-val="Investigated alert ${sc.id}. Verified source ${sc.correctAnswers.srcIP} targeting account ${sc.correctAnswers.targetUser}. Executed containment directive: ${sc.correctAnswers.containment}.">
                📋 Auto-fill Summary Text
              </button>
            </div>
          </div>
        </div>

        <!-- SIEM & Report Grid -->
        <div class="siem-layout">
          <!-- Left: SIEM Log Terminal -->
          <div class="log-terminal">
            <div class="log-terminal-header">
              <span>🖥️ SIEM LOG SEARCH CONSOLE (Click a log line to highlight as Key Evidence)</span>
              <span>Event Count: ${sc.logs.length}</span>
            </div>
            <div class="log-terminal-body" id="log-body">
              ${sc.logs.map(log => `
                <div 
                  class="log-line ${log.level === 'CRIT' ? 'severity-high' : ''} ${selectedLogId === log.id ? 'selected' : ''}"
                  data-log-id="${log.id}"
                >
                  <span style="color: var(--text-dim); margin-right: 8px;">[${log.time}]</span>
                  <span style="color: var(--accent-cyan); font-weight: 600;">[${log.source}]</span>
                  <span>${log.event}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Incident Report Form -->
          <div class="report-panel">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; justify-content: space-between;">
              <span>📝 Submit Triage Report</span>
              <span class="badge badge-cyan" id="selected-log-indicator">
                ${selectedLogId ? `Selected Evidence: ${selectedLogId}` : 'No Log Selected'}
              </span>
            </h3>

            <form id="triage-report-form" style="display: flex; flex-direction: column; gap: 12px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Alert Identification *</label>
                <select id="rep-alert-type" class="form-control" required>
                  <option value="">-- Select Alert Classification --</option>
                  ${sc.options.alertTypes.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Source IP / Host *</label>
                  <input type="text" id="rep-src-ip" class="form-control" placeholder="e.g. 185.220.101.5" required />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Target Account *</label>
                  <input type="text" id="rep-user" class="form-control" placeholder="e.g. j.doe" required />
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">MITRE ATT&CK Mapping *</label>
                <select id="rep-mitre" class="form-control" required>
                  <option value="">-- Select MITRE Technique --</option>
                  ${sc.options.mitreIDs.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Containment Action *</label>
                <select id="rep-containment" class="form-control" required>
                  <option value="">-- Select Containment Directive --</option>
                  ${sc.options.containmentActions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Analyst Incident Summary *</label>
                <textarea id="rep-summary" class="form-control" placeholder="Describe root cause and evidence timeline..." required></textarea>
              </div>

              <button type="submit" class="btn btn-success" style="margin-top: 6px;">
                <span>📊 Evaluate & Submit Report</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('button[data-idx]').forEach(b => {
      b.addEventListener('click', () => {
        selectedScenarioIndex = parseInt(b.getAttribute('data-idx'));
        selectedLogId = null;
        soundFx.playClick();
        render();
      });
    });

    container.querySelectorAll('.log-line').forEach(line => {
      line.addEventListener('click', () => {
        selectedLogId = line.getAttribute('data-log-id');
        soundFx.playClick();
        container.querySelectorAll('.log-line').forEach(l => l.classList.remove('selected'));
        line.classList.add('selected');
        const indicator = container.querySelector('#selected-log-indicator');
        if (indicator) indicator.textContent = `Selected Evidence: ${selectedLogId}`;
      });
    });

    // Guided Hint Auto-fill listener
    container.querySelectorAll('.hint-fill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const fieldId = btn.getAttribute('data-field');
        const exactVal = btn.getAttribute('data-val');
        const containsVal = btn.getAttribute('data-val-contains');
        const field = container.querySelector(`#${fieldId}`);

        if (field) {
          if (exactVal !== null) {
            field.value = exactVal;
          } else if (containsVal) {
            for (let opt of field.options) {
              if (opt.value.includes(containsVal)) {
                field.value = opt.value;
                break;
              }
            }
          }
        }
      });
    });

    const form = container.querySelector('#triage-report-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      evaluateReport(sc);
    });
  }

  function evaluateReport(sc) {
    const alertType = container.querySelector('#rep-alert-type').value;
    const srcIP = container.querySelector('#rep-src-ip').value.trim();
    const user = container.querySelector('#rep-user').value.trim();
    const mitre = container.querySelector('#rep-mitre').value;
    const containment = container.querySelector('#rep-containment').value;
    const summary = container.querySelector('#rep-summary').value.trim();

    let scoreAlertId = (alertType === sc.correctAnswers.alertType) ? 20 : 0;
    let scoreEvidence = (selectedLogId === sc.correctAnswers.keyLogId) ? 20 : (selectedLogId ? 10 : 0);
    let scoreInvestigation = (srcIP === sc.correctAnswers.srcIP && user.toLowerCase() === sc.correctAnswers.targetUser.toLowerCase()) ? 20 : 10;
    let scoreMitre = mitre.includes(sc.correctAnswers.mitreID) ? 10 : 0;
    let scoreContainment = (containment === sc.correctAnswers.containment) ? 10 : 0;
    let scoreReport = summary.length > 20 ? 15 : 5;
    let scoreTime = 5;

    const totalScore = scoreAlertId + scoreEvidence + scoreInvestigation + scoreMitre + scoreContainment + scoreReport + scoreTime;

    const result = stateManager.recordScore('tier1', sc.id, {
      total: totalScore,
      breakdown: { scoreAlertId, scoreEvidence, scoreInvestigation, scoreMitre, scoreContainment, scoreReport, scoreTime }
    });

    soundFx.playSuccess();
    showRubricModal(sc, totalScore, { scoreAlertId, scoreEvidence, scoreInvestigation, scoreMitre, scoreContainment, scoreReport, scoreTime }, result.newlyUnlocked, () => {
      render();
      if (onScenarioCompleted) onScenarioCompleted();
    });
  }

  render();
}

function showRubricModal(sc, totalScore, b, newlyUnlocked, onClose) {
  let backdrop = document.querySelector('#rubric-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'rubric-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 600px; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">${totalScore >= 70 ? '🎯' : '⚠️'}</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">
        Incident Score: <span style="color: ${totalScore >= 70 ? 'var(--accent-green)' : 'var(--accent-amber)'}">${totalScore}/100</span>
      </h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
        Evaluated for incident: <strong>${sc.title}</strong>
      </p>

      ${newlyUnlocked.length > 0 ? `
        <div class="unlock-celebration pulse-cyan" style="background: rgba(0, 255, 136, 0.1); border: 1px solid var(--accent-green); border-radius: var(--radius-md); margin: 16px 0; padding: 16px;">
          <div style="font-size: 2rem;">🎉 UNLOCKED NEW ROLE!</div>
          <h3 style="color: var(--accent-green); font-size: 1.2rem;">${newlyUnlocked.join(', ')}</h3>
          <p style="font-size: 0.8rem; color: var(--text-main);">You completed the required tasks & score threshold!</p>
        </div>
      ` : ''}

      <div style="margin: 20px 0; background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px; text-align: left;">
        <h4 style="font-size: 0.9rem; color: var(--accent-cyan); margin-bottom: 10px;">Rubric Breakdown:</h4>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
          <div style="display: flex; justify-content: space-between;"><span>Alert Identification (20%)</span><strong style="color: var(--accent-cyan);">${b.scoreAlertId}/20</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>Evidence Collection (20%)</span><strong style="color: var(--accent-cyan);">${b.scoreEvidence}/20</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>Investigation Depth (20%)</span><strong style="color: var(--accent-cyan);">${b.scoreInvestigation}/20</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>MITRE Mapping (10%)</span><strong style="color: var(--accent-cyan);">${b.scoreMitre}/10</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>Containment Directive (10%)</span><strong style="color: var(--accent-cyan);">${b.scoreContainment}/10</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>Incident Report Quality (15%)</span><strong style="color: var(--accent-cyan);">${b.scoreReport}/15</strong></div>
          <div style="display: flex; justify-content: space-between;"><span>Time / SLA Bonus (5%)</span><strong style="color: var(--accent-cyan);">${b.scoreTime}/5</strong></div>
        </div>
      </div>

      <button id="btn-close-rubric" class="btn btn-primary btn-lg" style="width: 100%;">
        <span>Close & Continue Triage</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.querySelector('#btn-close-rubric').addEventListener('click', () => {
    backdrop.classList.remove('active');
    if (onClose) onClose();
  });
}
