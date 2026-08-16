/* seniorScenarios.js - Tier 5 Senior SOC Manager Enterprise War Room Data */

export const SENIOR_SCENARIOS = [
  {
    id: "snr-war-01",
    title: "Enterprise Ransomware Outbreak & Concurrent Insider Threat",
    category: "Strategic Crisis Command",
    summary: "As Senior SOC Manager, navigate a multi-vector crisis: a major ransomware outbreak spreading in European offices while anomalous 500GB exfiltration is detected from the R&D database in North America.",
    threatVectors: [
      { id: "threat-1", title: "🔴 Enterprise Ransomware Outbreak (LockBit 3.0)", impact: "High", target: "EU Data Center & 300 Host Systems" },
      { id: "threat-2", title: "🟠 R&D Database Mass Exfiltration (Insider Threat)", impact: "Critical", target: "US IP-Vault-01 (500 GB Exfiltered)" },
      { id: "threat-3", title: "🟡 Global Phishing Campaign Targeting Executives", impact: "Medium", target: "Executive Leadership Mailboxes" }
    ],
    decisionMatrix: [
      {
        id: "dec-1",
        stage: "1. Global Network & AD Containment Strategy",
        question: "Ransomware is spreading via Active Directory Group Policy Objects (GPO). What immediate containment directive do you issue?",
        options: [
          "Sever cross-site MPLS/VPN tunnels between EU and Global sites & temporarily suspend AD Replication",
          "Shut down all global domain controllers, turning off power for the entire enterprise company-wide",
          "Do nothing and wait for local IT teams in EU to clean individual laptops"
        ],
        correct: "Sever cross-site MPLS/VPN tunnels between EU and Global sites & temporarily suspend AD Replication",
        explanation: "Severing inter-site connectivity halts lateral propagation across regions while maintaining local business operations where safe."
      },
      {
        id: "dec-2",
        stage: "2. Strategic Incident Prioritization",
        question: "How do you allocate the SOC's senior Incident Response (IR) resources between the 3 active threats?",
        options: [
          "Split SOC into two dedicated strike teams: Team A on Ransomware Isolation & Team B on Insider Exfiltration containment",
          "Assign all analysts exclusively to answering phone calls from panicking users",
          "Focus 100% of resources on the executive phishing emails and ignore the ransomware"
        ],
        correct: "Split SOC into two dedicated strike teams: Team A on Ransomware Isolation & Team B on Insider Exfiltration containment",
        explanation: "Dual-track response ensures critical IP theft is halted while ransomware spread is simultaneously mitigated."
      },
      {
        id: "dec-3",
        stage: "3. Executive & Regulatory Crisis Management",
        question: "The adversary demands a $10M ransom and threatens public leak within 24 hours. What is your recommendation to the Board of Directors & Legal Counsel?",
        options: [
          "Reject ransom payment, notify CISA/FBI and law enforcement, initiate system recovery from clean offline backups, and draft mandatory regulatory disclosure",
          "Pay the ransom immediately using corporate funds without consulting legal or regulatory bodies",
          "Hide the breach from regulators, employees, and stockholders"
        ],
        correct: "Reject ransom payment, notify CISA/FBI and law enforcement, initiate system recovery from clean offline backups, and draft mandatory regulatory disclosure",
        explanation: "Paying ransom carries legal/sanction risks and provides no decryption guarantee. Restoring from verified backups and meeting compliance requirements is the gold standard."
      }
    ]
  },
  {
    id: "snr-war-02",
    title: "Global Supply Chain Software Compromise War Room",
    category: "Supply Chain Crisis Command",
    summary: "Command response when a malicious backdoor is discovered inside an official software update pushed to 10,000 corporate client networks.",
    threatVectors: [
      { id: "threat-1", title: "🔴 Malicious Build Pipeline Poisoning (SolarWinds-style)", impact: "Critical", target: "Build Server & Signed Update Server" },
      { id: "threat-2", title: "🟠 Active C2 Command Traffic from Customer Networks", impact: "High", target: "10,000 External Customer Deployments" }
    ],
    decisionMatrix: [
      {
        id: "dec-101",
        stage: "1. Supply Chain Containment Directive",
        question: "What immediate action do you order regarding the software update server?",
        options: [
          "Revoke compromised code signing certificates, pull the update package from CDN, and publish emergency security advisory",
          "Delete the codebase repository and fire the software engineering team",
          "Deny all allegations on social media"
        ],
        correct: "Revoke compromised code signing certificates, pull the update package from CDN, and publish emergency security advisory",
        explanation: "Revoking certificates and revoking distribution halts infection vectors instantly."
      },
      {
        id: "dec-102",
        stage: "2. Customer & Legal Crisis Notification",
        question: "How do you coordinate customer communication and legal disclosure?",
        options: [
          "Issue transparent customer patch instructions, provide IOC hashes to CERT/CC, and brief regulatory authorities",
          "Only notify top 3 paying customers and keep small customers in the dark",
          "Blame customer network firewalls for the breach"
        ],
        correct: "Issue transparent customer patch instructions, provide IOC hashes to CERT/CC, and brief regulatory authorities",
        explanation: "Full transparency builds long-term trust and enables downstream security teams to remediate swiftly."
      }
    ]
  }
];
