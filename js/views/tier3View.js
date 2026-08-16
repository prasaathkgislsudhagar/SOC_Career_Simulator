/* tier3View.js - Tier 3 Threat Hunting & Topology Workspace */
import { TIER3_SCENARIOS } from '../data/tier3Scenarios.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderTier3View(container, onScenarioCompleted) {
  let selectedScenarioIndex = 0;
  let activeQuery = "";
  let answers = {}; // { questionIdx: selectedOption }

  function render() {
    const sc = TIER3_SCENARIOS[selectedScenarioIndex];
    const pastScores = stateManager.state.tierScores.tier3.scores[sc.id];

    container.innerHTML = `
      <div class="fade-in" style="width: 100%;">
        <!-- Header -->
        <div class="workspace-header">
          <div class="scenario-title-box">
            <h2>
              <span class="badge badge-purple">TIER 3 ANALYST</span>
              <span>${sc.title}</span>
            </h2>
            <div class="scenario-meta">
              <span>Category: <strong>${sc.category}</strong></span>
              <span>Severity: <strong style="color: var(--accent-red);">${sc.severity}</strong></span>
              ${pastScores ? `<span class="score-pill">Previous Score: ${pastScores.total}/100</span>` : ''}
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            ${TIER3_SCENARIOS.map((s, idx) => `
              <button 
                class="btn ${idx === selectedScenarioIndex ? 'btn-primary' : 'btn-outline'} btn-sm"
                data-idx="${idx}"
              >
                ${s.title.substring(0, 20)}...
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Network Topology Visualizer Container -->
        <div class="card" style="margin-bottom: 20px; padding: 14px;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <span>🌐 NETWORK INFRASTRUCTURE TOPOLOGY GRAPH</span>
            <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: normal;">Click host nodes to inspect network telemetry</span>
          </h3>

          <div class="topology-container">
            <svg class="topology-svg" viewBox="0 0 800 320">
              <!-- Connections -->
              <line x1="160" y1="160" x2="400" y2="100" stroke="var(--border-glow)" stroke-width="2" stroke-dasharray="4" />
              <line x1="400" y1="100" x2="640" y2="160" stroke="var(--accent-red)" stroke-width="2" />
              <line x1="400" y1="100" x2="400" y2="250" stroke="var(--border-glow)" stroke-width="2" />

              <!-- Nodes -->
              ${sc.topologyNodes.map((node, idx) => {
                const cx = idx === 0 ? 160 : (idx === 1 ? 400 : (idx === 2 ? 640 : 400));
                const cy = idx === 0 ? 160 : (idx === 1 ? 100 : (idx === 2 ? 160 : 250));
                const color = node.status === 'compromised' ? 'var(--accent-red)' : (node.status === 'infected' ? 'var(--accent-amber)' : 'var(--accent-cyan)');
                return `
                  <g class="top-node" data-ip="${node.ip}" style="cursor: pointer;">
                    <circle cx="${cx}" cy="${cy}" r="28" fill="var(--bg-panel)" stroke="${color}" stroke-width="3" />
                    <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold">
                      ${node.type === 'dc' ? '🏰' : (node.type === 'server' ? '🗄️' : '💻')}
                    </text>
                    <text x="${cx}" y="${cy + 44}" class="node-label">${node.label}</text>
                    <text x="${cx}" y="${cy + 58}" class="node-label" fill="var(--text-muted)" font-size="9">${node.ip}</text>
                  </g>
                `;
              }).join('')}
            </svg>
          </div>
        </div>

        <!-- Forensics SIEM Shell & Q&A Grid -->
        <div class="siem-layout">
          
          <!-- SIEM Shell Query -->
          <div class="log-terminal">
            <div class="log-terminal-header">
              <span>🔎 FORENSIC SIEM QUERY SHELL</span>
              <span>Available Queries</span>
            </div>
            <div style="padding: 10px; background: var(--bg-panel); border-bottom: 1px solid var(--border-dim); display: flex; gap: 8px;">
              <select id="query-select" class="form-control" style="font-family: var(--font-mono); font-size: 0.8rem;">
                <option value="">-- Execute Forensic Query --</option>
                ${sc.queryShellLogs.map(q => `<option value="${q.query}">${q.query}</option>`).join('')}
              </select>
            </div>
            <div class="log-terminal-body" id="shell-output">
              ${activeQuery ? `
                <div style="font-family: var(--font-mono); color: var(--accent-green); font-size: 0.85rem;">
                  > ${activeQuery}<br/>
                  <span style="color: var(--text-main);">
                    ${(sc.queryShellLogs.find(q => q.query === activeQuery) || {}).result}
                  </span>
                </div>
              ` : `
                <div style="color: var(--text-dim); text-align: center; margin-top: 40px; font-size: 0.84rem;">
                  Select a query from the dropdown above to execute SIEM search across endpoint logs.
                </div>
              `}
            </div>
          </div>

          <!-- Q&A Investigation Panel -->
          <div class="report-panel">
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
              🎯 Threat Hunting Findings Report
            </h3>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${sc.investigationQuestions.map((q, idx) => `
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 0.84rem;">
                    Q${idx + 1}: ${q.question}
                  </label>
                  <select class="form-control qa-select" data-qidx="${idx}">
                    <option value="">-- Select Answer --</option>
                    ${q.options.map(opt => `
                      <option value="${opt}" ${answers[idx] === opt ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                  </select>
                </div>
              `).join('')}
            </div>

            <button id="btn-submit-t3" class="btn btn-primary btn-lg" style="margin-top: 16px;">
              <span>🟣 Submit Threat Hunt Analysis</span>
            </button>
          </div>

        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('button[data-idx]').forEach(b => {
      b.addEventListener('click', () => {
        selectedScenarioIndex = parseInt(b.getAttribute('data-idx'));
        activeQuery = "";
        answers = {};
        soundFx.playClick();
        render();
      });
    });

    const qSelect = container.querySelector('#query-select');
    if (qSelect) {
      qSelect.addEventListener('change', () => {
        activeQuery = qSelect.value;
        soundFx.playClick();
        render();
      });
    }

    container.querySelectorAll('.qa-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const qidx = sel.getAttribute('data-qidx');
        answers[qidx] = sel.value;
        soundFx.playClick();
      });
    });

    container.querySelector('#btn-submit-t3').addEventListener('click', () => {
      evaluateTier3(sc);
    });
  }

  function evaluateTier3(sc) {
    let correctCount = 0;
    sc.investigationQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correctCount++;
    });

    const totalQuestions = sc.investigationQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const result = stateManager.recordScore('tier3', sc.id, {
      total: score,
      breakdown: { correctCount, totalQuestions }
    });

    soundFx.playSuccess();
    showTier3ResultModal(sc, score, correctCount, totalQuestions, result.newlyUnlocked, () => {
      render();
      if (onScenarioCompleted) onScenarioCompleted();
    });
  }

  render();
}

function showTier3ResultModal(sc, score, correct, total, newlyUnlocked, onClose) {
  let backdrop = document.querySelector('#t3-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 't3-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 600px; text-align: center;">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">${score >= 80 ? '🟣' : '⚠️'}</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">
        Threat Hunt Score: <span style="color: ${score >= 80 ? 'var(--accent-purple)' : 'var(--accent-amber)'}">${score}/100</span>
      </h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
        Scenario: <strong>${sc.title}</strong>
      </p>

      ${newlyUnlocked.length > 0 ? `
        <div class="unlock-celebration pulse-cyan" style="background: rgba(168, 85, 247, 0.15); border: 1px solid var(--accent-purple); border-radius: var(--radius-md); margin: 16px 0; padding: 16px;">
          <div style="font-size: 2rem;">🎉 UNLOCKED NEW ROLE!</div>
          <h3 style="color: var(--accent-purple); font-size: 1.2rem;">${newlyUnlocked.join(', ')}</h3>
          <p style="font-size: 0.8rem; color: var(--text-main);">You have unlocked SOC Management!</p>
        </div>
      ` : ''}

      <div style="margin: 20px 0; background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px; text-align: left;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
          <span>Threat Hunt Findings Accuracy (${correct}/${total} Correct)</span>
          <strong style="color: var(--accent-purple);">${score}%</strong>
        </div>
      </div>

      <button id="btn-close-t3" class="btn btn-primary btn-lg" style="width: 100%;">
        <span>Continue Threat Hunting Desk</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.querySelector('#btn-close-t3').addEventListener('click', () => {
    backdrop.classList.remove('active');
    if (onClose) onClose();
  });
}
