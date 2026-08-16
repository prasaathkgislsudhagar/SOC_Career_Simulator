/* managerScenarios.js - Tier 4 SOC Manager Dispatch & Operations Data */

export const MANAGER_SCENARIOS = [
  {
    id: "mgr-ops-01",
    title: "SOC Shift Operations & Alert Burst Management",
    category: "SOC Management & Triage",
    summary: "As SOC Manager, oversee 3 shift analysts, assign incoming high-volume incident tickets based on analyst skill tier, review analyst submitted reports, and authorize critical containment procedures.",
    analysts: [
      { id: "ana-1", name: "Alex Chen", role: "Tier 1 Analyst", skill: "Alert Triage", workloadPct: 40, status: "AVAILABLE" },
      { id: "ana-2", name: "Sam Miller", role: "Tier 2 Analyst", skill: "Log Correlation", workloadPct: 60, status: "BUSY" },
      { id: "ana-3", name: "Taylor Vance", role: "Tier 3 Analyst", skill: "Threat Hunting", workloadPct: 20, status: "AVAILABLE" }
    ],
    incomingIncidents: [
      { id: "inc-101", title: "Phishing Spam Campaign (50 Recipients)", reqTier: "Tier 1 Analyst", severity: "MEDIUM", optimalAssignee: "ana-1" },
      { id: "inc-102", title: "Webshell Creation on DMZ E-Commerce Server", reqTier: "Tier 2 Analyst", severity: "HIGH", optimalAssignee: "ana-2" },
      { id: "inc-103", title: "Active Directory Domain Admin Ticket Forgery", reqTier: "Tier 3 Analyst", severity: "CRITICAL", optimalAssignee: "ana-3" }
    ],
    reportsToReview: [
      {
        id: "rep-201",
        analystName: "Alex Chen",
        incidentTitle: "Multiple Failed SSH Logins on JumpHost",
        finding: "Analyst recommends restarting the JumpHost server during business hours.",
        isCorrect: false,
        correctFeedback: "REJECT: Restarting JumpHost causes downtime. Correct action is to block source IP on Firewall and enforce MFA."
      },
      {
        id: "rep-202",
        analystName: "Sam Miller",
        incidentTitle: "PowerShell Credential Dumping Alert",
        finding: "Analyst verified LSASS handle creation, isolated endpoint PC-34, and rotated user credentials.",
        isCorrect: true,
        correctFeedback: "APPROVE: Comprehensive response and isolation performed correctly."
      }
    ],
    escalationDecisions: [
      {
        id: "esc-301",
        issue: "Core ERP Database Server shows high CPU & anomalous outbound connections. Containment will pause manufacturing operations for 2 hours.",
        options: [
          "Authorize immediate ERP Server Network Quarantine & alert C-Suite of temporary outage",
          "Do not quarantine; let the server continue running while investigating in background",
          "Reboot server without taking network isolation steps"
        ],
        correct: "Authorize immediate ERP Server Network Quarantine & alert C-Suite of temporary outage",
        rationale: "Containing potential ransomware or exfiltration takes immediate precedence over temporary planned operational disruption."
      }
    ]
  },
  {
    id: "mgr-ops-02",
    title: "SOC Shift Crisis: High Volume Outage & SLA Breach",
    category: "Operations & Incident SLA",
    summary: "Manage a high-volume incident spike during night shift where multiple alerts threaten SLA breaches.",
    analysts: [
      { id: "ana-1", name: "Alex Chen", role: "Tier 1 Analyst", skill: "Alert Triage", workloadPct: 85, status: "OVERLOADED" },
      { id: "ana-2", name: "Sam Miller", role: "Tier 2 Analyst", skill: "Log Correlation", workloadPct: 30, status: "AVAILABLE" },
      { id: "ana-3", name: "Taylor Vance", role: "Tier 3 Analyst", skill: "Threat Hunting", workloadPct: 40, status: "AVAILABLE" }
    ],
    incomingIncidents: [
      { id: "inc-201", title: "Outbound C2 Connection on HR Workstation", reqTier: "Tier 2 Analyst", severity: "HIGH", optimalAssignee: "ana-2" },
      { id: "inc-202", title: "Suspicious Kerberos Ticket Request (Golden Ticket)", reqTier: "Tier 3 Analyst", severity: "CRITICAL", optimalAssignee: "ana-3" },
      { id: "inc-203", title: "Failed Password Spray Alert on Mail Portal", reqTier: "Tier 1 Analyst", severity: "LOW", optimalAssignee: "ana-1" }
    ],
    reportsToReview: [
      {
        id: "rep-301",
        analystName: "Taylor Vance",
        incidentTitle: "Kerberoasting Exploit Detection",
        finding: "Analyst performed ticket hash analysis, identified target service account, and initiated service account password rotation.",
        isCorrect: true,
        correctFeedback: "APPROVE: Excellent threat hunt response."
      }
    ],
    escalationDecisions: [
      {
        id: "esc-401",
        issue: "SIEM log ingestion pipeline is dropping events due to disk capacity reaching 98%. What is your manager action?",
        options: [
          "Authorize emergency log rotation & purge temporary debug files to restore SIEM ingestion immediately",
          "Disable firewall logging globally to reduce volume",
          "Shut down the SIEM server completely"
        ],
        correct: "Authorize emergency log rotation & purge temporary debug files to restore SIEM ingestion immediately",
        rationale: "Maintains SIEM visibility while resolving storage bottle-necks."
      }
    ]
  }
];
