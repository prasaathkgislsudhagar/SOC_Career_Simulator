/* tier2Scenarios.js - Tier 2 Analyst Incident Correlation & Attack Chains */

export const TIER2_SCENARIOS = [
  {
    id: "t2-chain-01",
    title: "Multi-Stage Credential Theft & Lateral Reconnaissance",
    category: "Investigation & Correlation",
    severity: "HIGH",
    summary: "Correlate disconnected authentication, host process, and network telemetry logs to reconstruct the 4-stage attack chain executed by the adversary.",
    stages: [
      { id: "stage1", name: "Initial Access", requiredKeyword: "Password Spray" },
      { id: "stage2", name: "Execution", requiredKeyword: "PowerShell" },
      { id: "stage3", name: "Credential Access", requiredKeyword: "lsass.exe" },
      { id: "stage4", name: "Command & Control / Exfil", requiredKeyword: "DNS Tunneling" }
    ],
    logsPool: [
      { id: "log-a", text: "20:10:01 [AUTH] Password Spray attack detected across 50 accounts from IP 198.51.100.42", stageMatch: "stage1" },
      { id: "log-b", text: "20:12:30 [AUTH] Successful VPN authentication for account 'a.davis' from IP 198.51.100.42", stageMatch: "stage1" },
      { id: "log-c", text: "20:15:00 [EDR] Spawned PowerShell.exe with -EncodedCommand executing hidden IEX script", stageMatch: "stage2" },
      { id: "log-d", text: "20:16:12 [EDR] Memory handle opened to lsass.exe by Rundll32.exe (ProcDump artifact)", stageMatch: "stage3" },
      { id: "log-e", text: "20:18:45 [DNS] High volume of encoded TXT queries to malicious C2 domain c2-exfil.xyz", stageMatch: "stage4" },
      { id: "log-f", text: "20:05:00 [SYS] Windows Update Service successfully applied KB5023706", stageMatch: "distractor" },
      { id: "log-g", text: "20:09:12 [NET] DHCP lease renewed for internal printer 10.0.1.200", stageMatch: "distractor" }
    ],
    fullReportQuestion: "What was the initial entry point and final intent of the adversary?",
    optionsReport: [
      "Password Spraying to gain valid credentials, followed by PowerShell execution to dump LSASS memory and exfiltrate credentials over DNS.",
      "SQL Injection on public website resulting in website defacement.",
      "Phishing email containing malware that encrypted local user files for ransom.",
      "DDoS attack targeting external firewall leading to network outage."
    ],
    correctReport: "Password Spraying to gain valid credentials, followed by PowerShell execution to dump LSASS memory and exfiltrate credentials over DNS."
  },
  {
    id: "t2-chain-02",
    title: "Web Application Compromise & Webshell Exfiltration",
    category: "Web & Endpoint Correlation",
    severity: "CRITICAL",
    summary: "Reconstruct a web server intrusion where an adversary exploited Apache Struts, deployed a PHP webshell, escalated privileges, and staged confidential SQL data.",
    stages: [
      { id: "stage1", name: "Exploitation", requiredKeyword: "HTTP 200 POST /upload.php" },
      { id: "stage2", name: "Persistence", requiredKeyword: "webshell c99.php" },
      { id: "stage3", name: "Privilege Escalation", requiredKeyword: "CVE-2021-4034 pkexec" },
      { id: "stage4", name: "Exfiltration", requiredKeyword: "HTTPS POST to 45.33.22.11" }
    ],
    logsPool: [
      { id: "log-a", text: "14:02:11 [APACHE] POST /upload.php HTTP/1.1 200 - Content-Type: multipart/form-data containing OGNL expression payload", stageMatch: "stage1" },
      { id: "log-b", text: "14:03:00 [FILE] New executable script created: /var/www/html/uploads/c99.php (chmod 755)", stageMatch: "stage2" },
      { id: "log-c", text: "14:05:22 [SEC] Local privilege escalation triggered via pkexec (CVE-2021-4034 PwnKit) -> root shell", stageMatch: "stage3" },
      { id: "log-d", text: "14:10:00 [NET] Large encrypted HTTPS POST payload (450MB) sent to external host 45.33.22.11", stageMatch: "stage4" },
      { id: "log-e", text: "13:50:00 [CRON] Daily system log rotation executed successfully", stageMatch: "distractor" }
    ],
    fullReportQuestion: "Identify the critical flaw exploited and the exfiltrated data scope.",
    optionsReport: [
      "Exploited file upload vulnerability to drop webshell 'c99.php', escalated to root via PwnKit, and exfiltrated data via HTTPS.",
      "Guessing SSH passwords on port 22.",
      "Cross-site scripting (XSS) targeting administrative user browser session.",
      "Physical theft of server hard drives from data center."
    ],
    correctReport: "Exploited file upload vulnerability to drop webshell 'c99.php', escalated to root via PwnKit, and exfiltrated data via HTTPS."
  },
  {
    id: "t2-chain-03",
    title: "Insider Threat Data Staging & Encrypted Exfiltration",
    category: "Insider Threat & DLP",
    severity: "HIGH",
    summary: "Trace an insider threat vector where an employee inserted an unauthorized USB drive, collected intellectual property archives, and uploaded files to cloud storage.",
    stages: [
      { id: "stage1", name: "Device Attachment", requiredKeyword: "USB Drive Plugged" },
      { id: "stage2", name: "Data Staging", requiredKeyword: "7zip Archive Creation" },
      { id: "stage3", name: "Evasion / Encryption", requiredKeyword: "AES-256 Encryption" },
      { id: "stage4", name: "Cloud Exfiltration", requiredKeyword: "HTTPS Upload mega.nz" }
    ],
    logsPool: [
      { id: "log-a", text: "11:20:05 [USB] Removable Media Inserted | Volume: KINGSTON (Serial: 994821) | User: CORP\\r.vance", stageMatch: "stage1" },
      { id: "log-b", text: "11:22:40 [FILE] 7z.exe created password-protected archive C:\\Users\\r.vance\\AppData\\Local\\Temp\\proj_secret.7z", stageMatch: "stage2" },
      { id: "log-c", text: "11:24:10 [SEC] AES-256 payload encryption verified on archive file containing 140 PDF blueprints", stageMatch: "stage3" },
      { id: "log-d", text: "11:28:15 [NET] Outbound HTTPS POST connection to user-mega.cloud-storage.nz (104.21.80.12)", stageMatch: "stage4" },
      { id: "log-e", text: "11:00:00 [SYS] Windows Defender Antivirus signatures updated to version 1.391.80", stageMatch: "distractor" }
    ],
    fullReportQuestion: "What exfiltration vector was used to bypass corporate Data Loss Prevention (DLP)?",
    optionsReport: [
      "Inserting unauthorized USB drive, compressing confidential project blueprints into password-protected 7z archive, and exfiltrating via Cloud Storage HTTPS upload.",
      "Sending printed paper documents via postal mail.",
      "Attaching malware to internal company newsletter.",
      "Formatting local hard drive C:."
    ],
    correctReport: "Inserting unauthorized USB drive, compressing confidential project blueprints into password-protected 7z archive, and exfiltrating via Cloud Storage HTTPS upload."
  }
];
