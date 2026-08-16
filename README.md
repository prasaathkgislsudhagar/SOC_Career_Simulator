# 🛡️ SOC Career Simulator & Cyber Defender Progression Platform

A full-stack, gamified cybersecurity operations center (SOC) simulation platform designed for aspiring security analysts and professionals. Players start as a **Tier 1 Security Analyst** and unlock higher roles (**Tier 2 Analyst**, **Tier 3 Incident Responder**, **SOC Manager**, and **Senior SOC Manager**) by analyzing realistic SIEM alerts, triaging incidents, mapping MITRE ATT&CK techniques, and meeting strict SLA response targets.

This repository combines the practical ambition of a cybersecurity learning portfolio with a live SOC simulation experience. It is meant to demonstrate hands-on skills in security operations, incident response, log analysis, threat detection, and security workflow automation.

---

## 🚀 Key Features

- **Realistic Incident Triage**: Live SIEM log console, threat intelligence, and guided hints for incident categorization.
- **Role Progression Tree**: Unlock advanced roles based on performance scoring averages.
- **Excel Database Integration**: User profiles are stored in server-side Excel (`data/users.xlsx` under the `Users` worksheet).
- **Profile-Based Auto-Authentication**: Direct registration → Excel save → automatic authentication into the SOC simulator without separate login friction.
- **Interactive Scoring Rubric**: 7-part evaluation (log analysis, MITRE ATT&CK alignment, containment directives, SLA compliance).
- **Audio Feedback**: Immersive cybersecurity SFX for alerts, clicks, completions, and errors.
- **Data Protection**: Direct static file downloads of database files (`data/users.xlsx`, `db/soc_platform.db`) are blocked for security.

---

## 🎯 Repository Objective

This project is designed to help users practice the real-world questions analysts ask during a live investigation:

> What happened?
>
> How do I detect it?
>
> How do I investigate it?
>
> Is it a true positive or false positive?
>
> What evidence should I collect?
>
> What should a SOC analyst do next?

The goal is to build practical judgment in cybersecurity operations rather than memorizing security theory alone.

---

## 📁 Project Structure

```text
.
├── index.html                  # Main application HTML shell
├── server.py                   # Python backend with openpyxl Excel integration & REST API
├── server.js                   # Node.js / Express backend option with xlsx library
├── package.json                # Node.js project manifest and dependencies
├── data/
│   └── users.xlsx              # Excel database (worksheet: Users)
├── db/
│   └── soc_platform.db         # SQLite storage for session tokens & progress
├── js/
│   ├── app.js                  # Application orchestrator & router
│   ├── api.js                  # HTTP REST API client
│   ├── state.js                # Central state management
│   ├── audio.js                # Web Audio API sound effects engine
│   ├── data/                   # Scenario data for Tiers 1-3, Manager & Senior Manager
│   └── views/                  # UI view controllers (Auth, Career Path, Rules, Tier workspaces)
├── css/
│   ├── main.css                # Global design system, typography & colors
│   ├── components.css          # Cards, badges, buttons, modals & toasts
│   ├── sim.css                 # SIEM terminal, triage forms & career map styles
│   └── animations.css          # Cyber scan lines, pulse glows & transitions
├── scripts/
│   └── export_users.py         # Utility script to export Excel users to CSV / JSON
├── README.md                  # Project overview and setup guide
└── .gitignore                 # Git ignore rules
```

---

## 🧠 Skills Demonstrated

This project demonstrates practical knowledge in:

- SOC operations and alert triage
- SIEM log investigation and correlation
- MITRE ATT&CK mapping and case analysis
- Incident response workflow and containment thinking
- Threat detection and suspicious behavior analysis
- Blue team defensive monitoring
- Security automation and data handling
- User and workflow data management for simulated SOC environments

---

## 🛠️ Technologies & Tools

- Python
- JavaScript
- HTML
- CSS
- Node.js
- SQLite / Excel integration
- Git & GitHub
- Security event analysis workflows
- SIEM-style interface design

---

## 💻 Quick Start

### Option 1: Python Backend (Recommended)

```bash
python3 server.py
```

Open http://localhost:8000 in your browser.

### Option 2: Node.js Backend

```bash
npm install
npm start
```

Open http://localhost:8000 in your browser.

---

## 📊 Exporting User Database

Use the helper script to export user records in a structured format:

```bash
python3 scripts/export_users.py
```

This helps maintain a repeatable data pipeline for the project’s user and progression records.

---

## ⚠️ Disclaimer

All project materials are created for educational and authorized cybersecurity practice purposes only. Do not use these techniques against systems, networks, or accounts without proper authorization.

---

## 🚀 Continuous Development

This repository is continuously being updated with additional SOC scenarios, defensive workflows, alert investigations, and new security simulation features.

**Learning → Building → Testing → Investigating → Improving**
To view or export the registered user profiles from `data/users.xlsx`:
```bash
# Print formatted user table in terminal
python3 scripts/export_users.py

# Export to CSV
python3 scripts/export_users.py --csv

# Export to JSON
python3 scripts/export_users.py --json
```

---

## 📜 License
MIT License. Built for cybersecurity training, academic labs, and hands-on defender skill development.
>>>>>>> df1e313 (Initial commit)
