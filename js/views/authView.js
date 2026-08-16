/* authView.js - SOC Defender Profile Creation & Excel Auto-Authentication Controller */
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderAuthView(container, onLoginSuccess) {
  let errorMessage = '';
  let isSubmitting = false;

  function render() {
    container.innerHTML = `
      <div class="fade-in" style="max-width: 500px; margin: 40px auto; width: 100%;">
        <div class="card pulse-cyan" style="border-color: var(--accent-cyan);">
          
          <!-- Header -->
          <div class="card-header" style="justify-content: center; flex-direction: column; gap: 8px; text-align: center;">
            <div class="logo-icon" style="width: 56px; height: 56px; font-size: 1.6rem;">SOC</div>
            <h2 style="font-size: 1.5rem; color: var(--text-main); font-weight: 800; letter-spacing: 0.5px;">
              SOC Career Simulator
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; max-width: 380px;">
              Professional Cyber Defense Training & Live Incident Simulation Platform
            </p>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.2); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600; margin-top: 4px;">
              <span>📊 Excel Database Integration Active</span>
            </div>
          </div>

          <!-- Error Alert Banner -->
          ${errorMessage ? `
            <div id="auth-error-box" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 12px; border-radius: var(--radius-sm); font-size: 0.88rem; text-align: center; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500;">
              <span>⚠️</span>
              <span>${errorMessage}</span>
            </div>
          ` : ''}

          <!-- Profile Creation Form -->
          <form id="form-register" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="reg-user">
                <span>Username / Call-Sign *</span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">Required</span>
              </label>
              <input 
                type="text" 
                id="reg-user" 
                class="form-control" 
                placeholder="e.g. CyberSentinel" 
                autocomplete="username" 
                required 
              />
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="reg-email">
                <span>Corporate / Student Email *</span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">Required</span>
              </label>
              <input 
                type="email" 
                id="reg-email" 
                class="form-control" 
                placeholder="analyst@soc.corp" 
                autocomplete="email" 
                required 
              />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="reg-exp">
                <span>Cybersecurity Experience Level *</span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">Required</span>
              </label>
              <select id="reg-exp" class="form-control" required style="cursor: pointer;">
                <option value="Beginner (Student / Entry Analyst)">Beginner (Student / Entry Analyst)</option>
                <option value="Intermediate (1-3 Years Experience)">Intermediate (1-3 Years Experience)</option>
                <option value="Advanced (SOC Lead / Engineer)">Advanced (SOC Lead / Engineer)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="reg-org">
                <span>College / Organization</span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">Optional</span>
              </label>
              <input 
                type="text" 
                id="reg-org" 
                class="form-control" 
                placeholder="e.g. Cyber Defense Academy or Acme Corp" 
              />
            </div>

            <div style="background: var(--bg-panel); padding: 12px; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-muted); border: 1px dashed var(--border-dim); display: flex; align-items: center; gap: 8px;">
              <span>💾</span>
              <span>Your profile will be saved to <strong style="color: var(--accent-cyan);">data/users.xlsx</strong> and automatically authenticated.</span>
            </div>

            <button 
              type="submit" 
              id="btn-create-profile" 
              class="btn btn-primary btn-lg" 
              style="margin-top: 4px; width: 100%;"
              ${isSubmitting ? 'disabled' : ''}
            >
              <span>${isSubmitting ? '⏳ Creating Profile...' : '🚀 Create Profile & Enter SOC'}</span>
            </button>
          </form>

        </div>
      </div>
    `;

    // Bind form submission listener
    const formRegister = container.querySelector('#form-register');
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = container.querySelector('#reg-user').value.trim();
        const email = container.querySelector('#reg-email').value.trim();
        const experience = container.querySelector('#reg-exp').value;
        const organization = container.querySelector('#reg-org').value.trim();

        // 1. Frontend Non-empty Validations
        if (!username) {
          errorMessage = 'Username / Call-Sign is required.';
          soundFx.playError();
          render();
          return;
        }

        if (!email) {
          errorMessage = 'Corporate / Student Email is required.';
          soundFx.playError();
          render();
          return;
        }

        // 2. Email Regex Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errorMessage = 'Please enter a valid email address.';
          soundFx.playError();
          render();
          return;
        }

        if (!experience) {
          errorMessage = 'Please select your cybersecurity experience level.';
          soundFx.playError();
          render();
          return;
        }

        isSubmitting = true;
        render();

        try {
          await stateManager.registerUser({ 
            username, 
            email, 
            experience, 
            organization 
          });
          
          soundFx.playSuccess();
          if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
          isSubmitting = false;
          soundFx.playError();
          errorMessage = err.message || 'Server or database error. Please try again.';
          render();
        }
      });
    }
  }

  render();
}
