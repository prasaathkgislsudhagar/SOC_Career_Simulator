/* rulesData.js - SOC platform rules, terms, and scoring criteria */

export const RULES_CONTENT = {
  title: "Welcome to the Security Operations Center (SOC)",
  overview: "You are entering a high-fidelity simulated SOC environment designed to simulate real-world cyber defense operations across 5 career progression tiers.",
  rules: [
    "Simulated Environment: All network logs, alerts, host systems, and artifacts are strictly fictional and sandboxed.",
    "Ethical Conduct: Techniques, scripts, and analytical workflows shown here must NEVER be executed against real-world external systems or unauthorized networks.",
    "Scoring Criteria: Incident scoring is multi-faceted. Your overall evaluation is based on Alert Identification, Evidence Collection, Investigation depth, MITRE mapping, Containment decisions, and Report quality.",
    "Progression Requirements: Higher SOC roles (Tier 2, Tier 3, SOC Manager, Senior SOC Manager) unlock automatically as you achieve target performance thresholds in lower tiers."
  ],
  scoringRubric: [
    { category: "Alert Identification", weight: "20%", desc: "Accurately identifying true positives vs false positives." },
    { category: "Evidence Collection", weight: "20%", desc: "Extracting correct IOCs (IPs, hashes, domain names, process IDs)." },
    { category: "Investigation Depth", weight: "20%", desc: "Reconstructing timeline and identifying root cause." },
    { category: "MITRE ATT&CK Mapping", weight: "10%", desc: "Correctly categorizing tactics and technique IDs (e.g. T1110, T1059)." },
    { category: "Containment Action", weight: "10%", desc: "Recommending or executing accurate isolation steps." },
    { category: "Incident Reporting", weight: "15%", desc: "Synthesizing executive summary and remediation recommendations." },
    { category: "Response Speed (Time)", weight: "5%", desc: "Completing investigation within expected SLA targets." }
  ],
  unlockThresholds: [
    { role: "🟢 Tier 1 Analyst", reqScore: "0%", status: "UNLOCKED", desc: "Entry-level alert triage & single-alert triage." },
    { role: "🔵 Tier 2 Analyst", reqScore: "70% overall Tier 1", status: "LOCKED", desc: "Incident correlation & multi-stage attack chain discovery." },
    { role: "🟣 Tier 3 Analyst", reqScore: "75% overall Tier 2", status: "LOCKED", desc: "Threat hunting, forensic query shell, multi-host AD incidents." },
    { role: "🟠 SOC Manager", reqScore: "80% overall Tier 3", status: "LOCKED", desc: "Resource allocation, tasking analysts, report approval, MTTR metrics." },
    { role: "🔴 Senior SOC Manager", reqScore: "85% overall Manager", status: "LOCKED", desc: "Enterprise crisis command, ransomware emergency, C-Suite strategy." }
  ]
};
