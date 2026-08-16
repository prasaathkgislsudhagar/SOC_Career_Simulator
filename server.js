/**
 * server.js - Node.js Express Backend for SOC Career Simulator with Excel Database (data/users.xlsx)
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 8000;

const DATA_DIR = path.join(__dirname, 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'users.xlsx');

const EXCEL_COLUMNS = [
  "User ID",
  "Username / Call-Sign",
  "Email",
  "Experience Level",
  "College / Organization",
  "Account Created At",
  "Last Login At",
  "Login Count",
  "Account Status"
];

// In-Memory storage for sessions, scores & unlocks
const sessions = new Map();
const userScores = new Map();
const userProgress = new Map();

function initExcel() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(EXCEL_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([EXCEL_COLUMNS]);
    ws['!cols'] = [
      { wch: 16 }, // User ID
      { wch: 24 }, // Username
      { wch: 28 }, // Email
      { wch: 32 }, // Experience Level
      { wch: 26 }, // College
      { wch: 22 }, // Created At
      { wch: 22 }, // Last Login At
      { wch: 14 }, // Login Count
      { wch: 16 }  // Account Status
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, EXCEL_FILE);
    console.log(`[EXCEL] Initialized ${EXCEL_FILE} with worksheet 'Users'`);
  }
}

function getExcelUsers() {
  if (!fs.existsSync(EXCEL_FILE)) return [];
  const wb = XLSX.readFile(EXCEL_FILE);
  if (!wb.Sheets['Users']) return [];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Users'], { header: 1 });
  if (rows.length <= 1) return [];

  return rows.slice(1).filter(r => r && r.length > 0).map(r => ({
    id: String(r[0] || ''),
    username: String(r[1] || ''),
    email: String(r[2] || ''),
    experience: String(r[3] || ''),
    college: String(r[4] || ''),
    organization: String(r[4] || ''),
    createdAt: String(r[5] || ''),
    lastLoginAt: String(r[6] || ''),
    loginCount: r[7] !== undefined ? r[7] : 1,
    accountStatus: String(r[8] || 'Active')
  }));
}

function addExcelUser(user) {
  const wb = fs.existsSync(EXCEL_FILE) ? XLSX.readFile(EXCEL_FILE) : XLSX.utils.book_new();
  let ws = wb.Sheets['Users'];
  if (!ws) {
    ws = XLSX.utils.aoa_to_sheet([EXCEL_COLUMNS]);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
  }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  rows.push([
    user.id,
    user.username,
    user.email,
    user.experience,
    user.college || user.organization || '',
    user.createdAt,
    user.lastLoginAt,
    user.loginCount,
    user.accountStatus
  ]);

  const newWs = XLSX.utils.aoa_to_sheet(rows);
  wb.Sheets['Users'] = newWs;
  XLSX.writeFile(wb, EXCEL_FILE);
  console.log(`[EXCEL] Registered new user '${user.username}' (${user.id}) in ${EXCEL_FILE}`);
}

function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

app.use(express.json());

// Security: Block direct public access to data/ and db/
app.use((req, res, next) => {
  const decoded = decodeURIComponent(req.path);
  if (decoded.startsWith('/data') || decoded.startsWith('/db') || decoded.toLowerCase().includes('users.xlsx')) {
    return res.status(403).json({ error: 'Access Forbidden: Database files cannot be downloaded directly.' });
  }
  next();
});

// Middleware to extract bearer token
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = sessions.get(token);
  next();
}

// ----------------------------------------------------
// CREATE PROFILE & REGISTER (Auto-Authenticate)
// ----------------------------------------------------
app.post(['/api/auth/register', '/api/register'], (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim();
  const experience = String(req.body.experience || 'Beginner (Student / Entry Analyst)').trim();
  const college = String(req.body.college || req.body.organization || '').trim();

  // 1. Non-empty Validation
  if (!username) {
    return res.status(400).json({ error: 'Username / Call-Sign is required.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Corporate / Student Email is required.' });
  }
  if (!experience) {
    return res.status(400).json({ error: 'Cybersecurity Experience Level is required.' });
  }

  // 2. Email Regex Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // 3. Duplicate Username & Email Check in Excel
  const existingUsers = getExcelUsers();
  for (const u of existingUsers) {
    if (u.username.toLowerCase() === username.toLowerCase()) {
      return res.status(400).json({ error: 'Username already exists. Please choose another username.' });
    }
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
  }

  // 4. Generate User ID and Timestamps
  const userSeq = existingUsers.length + 1;
  const userId = `USER-${1000 + userSeq}`;
  const nowStr = formatDate(new Date());

  const newUser = {
    id: userId,
    username,
    email,
    experience,
    college,
    organization: college,
    createdAt: nowStr,
    lastLoginAt: nowStr,
    loginCount: 1,
    accountStatus: 'Active'
  };

  // 5. Append to data/users.xlsx
  try {
    addExcelUser(newUser);
  } catch (err) {
    console.error('[EXCEL ERROR]', err);
    return res.status(500).json({ error: 'Excel database error. Could not save user.' });
  }

  // 6. Automatic Authentication
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, newUser);

  userProgress.set(userId, {
    currentRole: 'tier1',
    unlockedTiers: { tier1: true, tier2: false, tier3: false, manager: false, senior: false, master: false }
  });

  return res.status(201).json({
    token,
    user: newUser
  });
});

// ----------------------------------------------------
// GET CURRENT USER PROFILE & PROGRESS
// ----------------------------------------------------
app.get('/api/me', authenticate, (req, res) => {
  const user = req.user;
  const progress = userProgress.get(user.id) || {
    currentRole: 'tier1',
    unlockedTiers: { tier1: true, tier2: false, tier3: false, manager: false, senior: false, master: false }
  };

  const scores = userScores.get(user.id) || {
    tier1: { scores: {}, average: 0 },
    tier2: { scores: {}, average: 0 },
    tier3: { scores: {}, average: 0 },
    manager: { scores: {}, average: 0 },
    senior: { scores: {}, average: 0 }
  };

  res.json({
    user,
    currentRole: progress.currentRole,
    tierScores: scores,
    unlockedTiers: progress.unlockedTiers
  });
});

// ----------------------------------------------------
// SAVE SCENARIO SCORE & PROGRESSION
// ----------------------------------------------------
app.post('/api/score', authenticate, (req, res) => {
  const user = req.user;
  const { tier, scenarioId, totalScore, breakdown } = req.body;

  if (!userScores.has(user.id)) {
    userScores.set(user.id, {
      tier1: { scores: {}, average: 0 },
      tier2: { scores: {}, average: 0 },
      tier3: { scores: {}, average: 0 },
      manager: { scores: {}, average: 0 },
      senior: { scores: {}, average: 0 }
    });
  }

  const userTierScores = userScores.get(user.id);
  if (userTierScores[tier]) {
    userTierScores[tier].scores[scenarioId] = {
      total: totalScore,
      breakdown: breakdown || {}
    };

    const vals = Object.values(userTierScores[tier].scores).map(s => s.total);
    userTierScores[tier].average = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }

  const progress = userProgress.get(user.id) || {
    currentRole: 'tier1',
    unlockedTiers: { tier1: true, tier2: false, tier3: false, manager: false, senior: false, master: false }
  };

  const newlyUnlocked = [];
  const t1Scores = Object.keys(userTierScores.tier1.scores).length;
  const t2Scores = Object.keys(userTierScores.tier2.scores).length;
  const t3Scores = Object.keys(userTierScores.tier3.scores).length;
  const mgrScores = Object.keys(userTierScores.manager.scores).length;
  const snrScores = Object.keys(userTierScores.senior.scores).length;

  if (t1Scores >= 2 && userTierScores.tier1.average >= 70 && !progress.unlockedTiers.tier2) {
    progress.unlockedTiers.tier2 = true;
    newlyUnlocked.push('Tier 2 Analyst');
  }
  if (t2Scores >= 2 && userTierScores.tier2.average >= 75 && !progress.unlockedTiers.tier3) {
    progress.unlockedTiers.tier3 = true;
    newlyUnlocked.push('Tier 3 Analyst');
  }
  if (t3Scores >= 2 && userTierScores.tier3.average >= 80 && !progress.unlockedTiers.manager) {
    progress.unlockedTiers.manager = true;
    newlyUnlocked.push('SOC Manager');
  }
  if (mgrScores >= 2 && userTierScores.manager.average >= 85 && !progress.unlockedTiers.senior) {
    progress.unlockedTiers.senior = true;
    newlyUnlocked.push('Senior SOC Manager');
  }
  if (snrScores >= 2 && userTierScores.senior.average >= 90 && !progress.unlockedTiers.master) {
    progress.unlockedTiers.master = true;
    newlyUnlocked.push('SOC Master');
  }

  res.json({
    success: true,
    newlyUnlocked,
    tierAverage: userTierScores[tier] ? userTierScores[tier].average : 0
  });
});

// ----------------------------------------------------
// LOGOUT
// ----------------------------------------------------
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

// Serve static frontend
app.use(express.static(__dirname));

initExcel();

app.listen(PORT, () => {
  console.log('==========================================================');
  console.log(`🛡️  SOC Career Simulator Node Backend Active on http://localhost:${PORT}`);
  console.log(`📊  EXCEL: data/users.xlsx (Worksheet: Users)`);
  console.log(`🔐  FLOW:  Create Profile -> Save to Excel -> Auto Login -> SOC`);
  console.log('==========================================================');
});
