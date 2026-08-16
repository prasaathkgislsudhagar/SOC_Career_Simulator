/* rulesView.js - Rules + Terms & Conditions Modal & Screen */
import { RULES_CONTENT } from '../data/rulesData.js';
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderRulesModal(onAgreeSuccess) {
  let backdrop = document.querySelector('#rules-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'rules-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  const user = stateManager.state.user;

  backdrop.innerHTML = `
    <div class="modal-content fade-in" style="max-width: 720px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-cyan" style="font-size: 0.8rem; margin-bottom: 8px;">SECURITY OPERATIONS CENTER</span>
        <h2 style="font-size: 1.6rem; color: var(--text-main); font-weight: 800;">${RULES_CONTENT.title}</h2>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;">
          Welcome, <strong>${user ? user.username : 'Defender'}</strong>! Please review the operational directives below.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px;">
          <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 8px;">📜 Platform Directives & Ethical Rules</h3>
          <ul style="padding-left: 20px; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
            ${RULES_CONTENT.rules.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="background: var(--bg-panel); border: 1px solid var(--border-dim); border-radius: var(--radius-md); padding: 16px;">
          <h3 style="font-size: 0.95rem; color: var(--accent-green); margin-bottom: 8px;">📊 7-Part Performance Scoring Rubric</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-dim); color: var(--text-main);">
                <th style="padding: 6px;">Category</th>
                <th style="padding: 6px;">Weight</th>
                <th style="padding: 6px;">Description</th>
              </tr>
            </thead>
            <tbody>
              ${RULES_CONTENT.scoringRubric.map(item => `
                <tr style="border-bottom: 1px dashed var(--border-dim); color: var(--text-muted);">
                  <td style="padding: 6px; font-weight: 600; color: var(--text-main);">${item.category}</td>
                  <td style="padding: 6px; color: var(--accent-cyan); font-weight: 700;">${item.weight}</td>
                  <td style="padding: 6px;">${item.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; border-top: 1px solid var(--border-dim); padding-top: 20px;">
        <label class="checkbox-label">
          <input type="checkbox" id="terms-agree-check" />
          <span>☑ I have read and agree to the Rules, Terms & Conditions for SOC Operations.</span>
        </label>

        <button id="btn-agree-continue" class="btn btn-success btn-lg" disabled style="width: 100%;">
          <span>🚀 Continue to Role Selection & Career Path →</span>
        </button>
      </div>
    </div>
  `;

  backdrop.classList.add('active');

  const check = backdrop.querySelector('#terms-agree-check');
  const btn = backdrop.querySelector('#btn-agree-continue');

  check.addEventListener('change', () => {
    btn.disabled = !check.checked;
    if (check.checked) soundFx.playClick();
  });

  btn.addEventListener('click', () => {
    soundFx.playSuccess();
    stateManager.acceptTerms();
    backdrop.classList.remove('active');
    if (onAgreeSuccess) onAgreeSuccess();
  });
}
