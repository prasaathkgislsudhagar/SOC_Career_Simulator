/* tier3Scenarios.js - Tier 3 Threat Hunting & Topology Forensics */

export const TIER3_SCENARIOS = [
  {
    id: "t3-hunt-01",
    title: "Active Directory Domain Compromise & Lateral Movement",
    category: "Threat Hunting & AD Forensics",
    severity: "CRITICAL",
    summary: "An advanced persistent threat (APT) compromised PC-WORK-01, extracted Kerberos TGS tickets (Kerberoasting), moved laterally via SMB to DC-01, and dumped the Active Directory database (NTDS.dit).",
    topologyNodes: [
      { id: "node-1", label: "PC-WORK-01", ip: "10.0.1.15", type: "workstation", status: "compromised", role: "Initial Foothold" },
      { id: "node-2", label: "DC-01 (Domain Controller)", ip: "10.0.0.1", type: "dc", status: "infected", role: "Target Domain Controller" },
      { id: "node-3", label: "DATA-SERVER-01", ip: "10.0.2.80", type: "server", status: "targeted", role: "Database Server" },
      { id: "node-4", label: "PC-DEV-02", ip: "10.0.1.44", type: "workstation", status: "clean", role: "Clean Developer Node" }
    ],
    queryShellLogs: [
      { query: "index=winlog EventCode=4769", result: "4769 | Kerberos Service Ticket Request | TargetService: MSSQLSvc/db01.corp | Encryption: RC4_HMAC | Client: 10.0.1.15 (PC-WORK-01)" },
      { query: "index=winlog EventCode=4624", result: "4624 | Network Logon Type 3 | User: CORP\\svc_sql | SrcIP: 10.0.1.15 -> DstIP: 10.0.0.1 (DC-01) | Auth: NTLMv2" },
      { query: "index=edr process=ntdsutil", result: "COMMAND: ntdsutil.exe 'ac i ntds' 'ifm' 'create full C:\\Windows\\Temp\\AD_Dump' q q | Executed on DC-01 by CORP\\svc_sql" },
      { query: "index=firewall dst_port=445", result: "10.0.0.1 (DC-01) -> 10.0.2.80 (DATA-SERVER-01) | SMB Traffic: 8.4 GB transferred" }
    ],
    investigationQuestions: [
      {
        question: "What specific Kerberos attack vector was executed from PC-WORK-01?",
        options: ["Kerberoasting (T1558.003)", "AS-REP Roasting", "Golden Ticket Forgery", "Pass-the-Hash"],
        correct: "Kerberoasting (T1558.003)"
      },
      {
        question: "Which compromised service account was used for lateral movement to DC-01?",
        options: ["CORP\\svc_sql", "CORP\\Administrator", "CORP\\j.doe", "SYSTEM"],
        correct: "CORP\\svc_sql"
      },
      {
        question: "What utility was invoked on DC-01 to harvest Active Directory credentials?",
        options: ["ntdsutil.exe", "mimikatz.exe", "pwdump.exe", "vssadmin.exe"],
        correct: "ntdsutil.exe"
      }
    ]
  },
  {
    id: "t3-hunt-02",
    title: "Cobalt Strike Beacon Detection & Ransomware Staging",
    category: "Memory Forensics & C2 Hunting",
    severity: "CRITICAL",
    summary: "Detect stealthy C2 beaconing signatures in memory space, identify injected DLL threads, and block imminent enterprise ransomware deployment.",
    topologyNodes: [
      { id: "node-1", label: "SRV-FILE-01", ip: "10.0.5.10", type: "server", status: "infected", role: "Primary File Server" },
      { id: "node-2", label: "SRV-APP-02", ip: "10.0.5.12", type: "server", status: "compromised", role: "App Server" },
      { id: "node-3", label: "EXTERNAL-C2", ip: "192.0.2.99", type: "external", status: "malicious", role: "C2 Command Host" }
    ],
    queryShellLogs: [
      { query: "index=sysmon EventID=8", result: "CreateRemoteThread | SourceProcess: svchost.exe (PID 840) -> TargetProcess: explorer.exe (PID 2100) | StartAddress: 0x00007FF8" },
      { query: "index=netflow dst=192.0.2.99", result: "HTTP POST /jquery-3.3.1.min.js | Interval: 60s jitter=15% | Beacon Payload Detected" },
      { query: "index=edr command=*vssadmin*", result: "Process Create: vssadmin.exe delete shadows /all /quiet | Executed on SRV-FILE-01" }
    ],
    investigationQuestions: [
      {
        question: "What injection technique was used to hide the C2 Beacon in explorer.exe?",
        options: ["CreateRemoteThread Process Injection (T1055.002)", "Process Hollowing", "DLL Side-Loading", "Reflective DLL Loading"],
        correct: "CreateRemoteThread Process Injection (T1055.002)"
      },
      {
        question: "What preparatory command indicates ransomware deployment is imminent?",
        options: ["vssadmin.exe delete shadows /all /quiet", "ipconfig /all", "netstat -ano", "whoami /all"],
        correct: "vssadmin.exe delete shadows /all /quiet"
      }
    ]
  },
  {
    id: "t3-hunt-03",
    title: "APT Persistence via WMI Event Subscriptions & Scheduled Tasks",
    category: "Persistence & Forensics",
    severity: "HIGH",
    summary: "Uncover stealthy persistence mechanisms installed by an adversary to maintain long-term unauthorized access across reboot cycles.",
    topologyNodes: [
      { id: "node-1", label: "PC-FIN-03", ip: "10.0.4.88", type: "workstation", status: "compromised", role: "Finance PC" },
      { id: "node-2", label: "DC-01", ip: "10.0.0.1", type: "dc", status: "clean", role: "Domain Controller" }
    ],
    queryShellLogs: [
      { query: "index=sysmon EventID=19", result: "WmiEventConsumer | Name: SystemMonitorConsumer | Destination: C:\\Windows\\System32\\scrcons.exe | ScriptText: powershell.exe -w hidden -c..." },
      { query: "index=winlog EventCode=4698", result: "A scheduled task was created | TaskName: \\Microsoft\\Windows\\Maintenance\\UpdaterTask | Command: C:\\Users\\Public\\backdoor.exe" }
    ],
    investigationQuestions: [
      {
        question: "Which fileless persistence mechanism was created via Sysmon EventID 19?",
        options: ["WMI Event Consumer (T1546.003)", "Registry Run Keys", "Startup Folder Shortcut", "Service Controller Installation"],
        correct: "WMI Event Consumer (T1546.003)"
      },
      {
        question: "What masqueraded scheduled task name was created under the Maintenance folder?",
        options: ["\\Microsoft\\Windows\\Maintenance\\UpdaterTask", "\\System32\\Clean.job", "\\GoogleUpdateTask", "\\AdobeUpdater"],
        correct: "\\Microsoft\\Windows\\Maintenance\\UpdaterTask"
      }
    ]
  }
];
