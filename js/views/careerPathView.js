/* careerPathView.js - SOC Hierarchy Map & Multi-Task Role Progression Screen */
import { stateManager } from '../state.js';
import { soundFx } from '../audio.js';

export function renderCareerPathView(container, onRoleSelected) {
  const state = stateManager.state;
  const user = state.user;
  const scores = state.tierScores;
  const unlocks = state.unlockedTiers;

  const t1Done = Object.keys(scores.tier1.scores).length;
  const t2Done = Object.keys(scores.tier2.scores).length;
  const t3Done = Object.keys(scores.tier3.scores).length;
  const mgrDone = Object.keys(scores.manager.scores).length;
  const snrDone = Object.keys(scores.senior.scores).length;

  const roles = [
    {
      id: 'tier1',
      title: '🟢 TIER 1 SOC ANALYST',
      subtitle: 'Alert Triage & Entry-Level Investigation',
      reqScoreText: 'Tasks Required: Complete 2+ Incidents (Req Score: 0%)',
      tasksDone: `${t1Done}/3 Tasks Completed`,
      currentAvg: scores.tier1.average,
      unlocked: unlocks.tier1,
      tierClass: 'tier-1',
      accentColor: 'var(--tier1-color)',
      desc: 'Investigate authentication bursts, obfuscated endpoint PowerShell commands, and executive phishing alerts.'
    },
    {
      id: 'tier2',
      title: '🔵 TIER 2 SOC ANALYST',
      subtitle: 'Incident Correlation & Attack Chain Discovery',
      reqScoreText: 'Unlock Req: Complete 2+ Tier 1 Tasks with 70%+ Average',
      tasksDone: `${t2Done}/3 Tasks Completed`,
      currentAvg: scores.tier2.average,
      unlocked: unlocks.tier2,
      tierClass: 'tier-2',
      accentColor: 'var(--tier2-color)',
      desc: 'Correlate disconnected authentication, web exploit, and process execution logs into multi-stage attack chains.'
    },
    {
      id: 'tier3',
      title: '🟣 TIER 3 SOC ANALYST',
      subtitle: 'Threat Hunting & Active Directory Forensics',
      reqScoreText: 'Unlock Req: Complete 2+ Tier 2 Tasks with 75%+ Average',
      tasksDone: `${t3Done}/3 Tasks Completed`,
      currentAvg: scores.tier3.average,
      unlocked: unlocks.tier3,
      tierClass: 'tier-3',
      accentColor: 'var(--tier3-color)',
      desc: 'Hunt adversaries across multi-host network topology, trace Kerberoasting lateral movement, and analyze C2 beacons.'
    },
    {
      id: 'tierManager',
      title: '🟠 SOC MANAGER',
      subtitle: 'Analyst Management, SLA & Incident Operations',
      reqScoreText: 'Unlock Req: Complete 2+ Tier 3 Tasks with 80%+ Average',
      tasksDone: `${mgrDone}/2 Tasks Completed`,
      currentAvg: scores.manager.average,
      unlocked: unlocks.manager,
      tierClass: 'tier-manager',
      accentColor: 'var(--manager-color)',
      desc: 'Manage shift analyst team, prioritize high-burst incident queues, track MTTR/MTTD metrics, and authorize containment.'
    },
    {
      id: 'tierSenior',
      title: '🔴 SENIOR SOC MANAGER',
      subtitle: 'Enterprise Strategic Crisis War Room',
      reqScoreText: 'Unlock Req: Complete 2+ Manager Tasks with 85%+ Average',
      tasksDone: `${snrDone}/2 Tasks Completed`,
      currentAvg: scores.senior.average,
      unlocked: unlocks.senior,
      tierClass: 'tier-senior',
      accentColor: 'var(--senior-color)',
      desc: 'Command enterprise-wide crisis response: navigate simultaneous ransomware outbreaks, board PR, and strategic decision trees.'
    }
  ];

  container.innerHTML = `
    <div class="fade-in" style="max-width: 1000px; margin: 0 auto; width: 100%;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge badge-cyan" style="margin-bottom: 8px;">DEFENDER PROFILE: ${user ? user.username : 'CyberSentinel'}</span>
        <h1 style="font-size: 2rem; font-weight: 800; color: var(--text-main);">SOC Career Hierarchy</h1>
        <p style="color: var(--text-muted); max-width: 650px; margin: 8px auto 0 auto; font-size: 0.92rem;">
          Welcome <strong>${user ? user.username : 'Defender'}</strong> (${user ? user.email : 'analyst@soc.corp'}). Complete 2-3 incident tasks per tier with target scores to unlock the next role!
        </p>
      </div>

      ${unlocks.master ? `
        <div class="card pulse-cyan" style="border-color: var(--master-color); background: rgba(255, 215, 0, 0.05); margin-bottom: 24px; text-align: center; padding: 24px;">
          <div style="font-size: 3rem;">🏆</div>
          <h2 style="color: var(--master-color); font-size: 1.6rem; font-weight: 800;">SOC MASTER UNLOCKED</h2>
          <p style="color: var(--text-main); font-size: 0.95rem; margin-top: 6px;">
            Congratulations <strong>${user ? user.username : 'Defender'}</strong>! You have completed all multi-task operational tiers!
          </p>
        </div>
      ` : ''}

      <div style="display: flex; flex-direction: column; gap: 18px;">
        ${roles.map(r => `
          <div class="card" style="border-color: ${r.unlocked ? r.accentColor : 'var(--border-dim)'}; opacity: ${r.unlocked ? 1 : 0.75};">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
              
              <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 280px;">
                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: ${r.unlocked ? 'rgba(14, 19, 31, 0.8)' : 'var(--bg-panel)'}; border: 1px solid ${r.accentColor}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                  ${r.unlocked ? '🔓' : '🔒'}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${r.title}</h3>
                    <span class="tier-pill ${r.tierClass}">${r.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                    <span class="badge badge-cyan" style="font-size: 0.72rem;">${r.tasksDone}</span>
                  </div>
                  <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 2px;">${r.subtitle}</p>
                  <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">${r.desc}</p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 240px;">
                <div style="text-align: right;">
                  <span style="font-size: 0.78rem; color: var(--text-dim); display: block;">${r.reqScoreText}</span>
                  <span style="font-size: 0.95rem; font-weight: 700; color: ${r.currentAvg > 0 ? r.accentColor : 'var(--text-muted)'}">
                    Current Tier Avg: ${r.currentAvg}%
                  </span>
                </div>
                <button 
                  class="btn ${r.unlocked ? 'btn-primary' : 'btn-outline'}" 
                  data-role="${r.id}"
                  ${!r.unlocked ? 'disabled' : ''}
                  style="min-width: 160px;"
                >
                  ${r.unlocked ? '<span>Enter Operational Desk →</span>' : '<span>🔒 Locked (Complete Prev Tier)</span>'}
                </button>
              </div>

            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('button[data-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      const roleId = btn.getAttribute('data-role');
      soundFx.playClick();
      if (stateManager.setCurrentRole(roleId)) {
        if (onRoleSelected) onRoleSelected(roleId);
      }
    });
  });
}
