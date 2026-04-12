
function peso(n) { return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }); }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }); }
function genTxnId() { return 'TXN-' + Math.random().toString(36).toUpperCase().substr(2, 8); }
function statusBadge(s) { const c = (s || '').toLowerCase(); return `<span class="status status-${c}">${s}</span>`; }


function toast(msg, icon = 'ok') {
  const t   = document.getElementById('toast');
  const ico = document.getElementById('toastIcon');
  const txt = document.getElementById('toastMsg');
  if (!t) return;
  const icons = { ok: '✅', err: '❌', warn: '⚠️', info: 'ℹ️', bye: '👋', ban: '🚫' };
  if (ico) ico.textContent = icons[icon] || icon;
  if (txt) txt.textContent = msg;
  t.style.display = 'flex';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}


function showModal(id)  { document.getElementById(id)?.classList.add('active');    }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }


function toggleTheme() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  const next    = isLight ? '' : 'light';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('ls_theme', next);
  // Update ALL theme toggle button icons on the page
  updateThemeIcons(next);
}

function updateThemeIcons(theme) {
  const isLight = theme === 'light';
  // Update any button that calls toggleTheme
  document.querySelectorAll('[onclick="toggleTheme()"], [data-theme-btn]').forEach(btn => {
    btn.textContent = isLight ? '☀️' : '🌙';
    btn.title       = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  });
}

function applyStoredTheme() {
  const saved = localStorage.getItem('ls_theme') || '';
  document.body.setAttribute('data-theme', saved);
  updateThemeIcons(saved);
}


function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }


function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}


function calcAge() {
  const bday = document.getElementById('regBday')?.value;
  if (!bday) return;
  const age = Math.floor((Date.now() - new Date(bday)) / 3.15576e10);
  const el = document.getElementById('regAge');
  if (el) el.value = age >= 0 ? age : '';
}


function selectAccType(el, type) {
  document.querySelectorAll('.acc-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selectedType').value = type;
}


function validatePassword(password) {
  const errors = [];
  if (password.length < 8)             errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password))         errors.push('one uppercase letter (A–Z)');
  if (!/[a-z]/.test(password))         errors.push('one lowercase letter (a–z)');
  if (!/[0-9]/.test(password))         errors.push('one number (0–9)');
  if (!/[^A-Za-z0-9]/.test(password))  errors.push('one special character (!@#$%^&*)');
  return errors;
}

function checkPasswordStrength(inputId, barId, labelId) {
  const pw  = document.getElementById(inputId)?.value || '';
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(labelId);
  if (!bar) return;
  if (!pw) { bar.style.width = '0'; if (lbl) lbl.textContent = ''; return; }
  let score = 0;
  if (pw.length >= 8)            score++;
  if (pw.length >= 12)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[a-z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const level = score <= 2 ? { pct: '33%', color: '#fb7185', label: 'Weak'   }
              : score <= 4 ? { pct: '66%', color: '#fbbf24', label: 'Medium' }
              :               { pct: '100%',color: '#34d399', label: 'Strong' };
  bar.style.width      = level.pct;
  bar.style.background = level.color;
  if (lbl) { lbl.textContent = level.label; lbl.style.color = level.color; }
}


function selectTerm(btn, months) {
  document.querySelectorAll('#applyLoanModal .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  STATE.selectedLoanTerm = months;
  updateLoanCalc();
}

function updateLoanCalc() {
  const amount = parseFloat(document.getElementById('loanAmountSelect').value);
  const term   = STATE.selectedLoanTerm;
  const box    = document.getElementById('loanCalcBox');
  if (!amount || !term) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const interest = amount * 0.03;
  document.getElementById('calcAmount').textContent   = peso(amount);
  document.getElementById('calcInterest').textContent = '-' + peso(interest);
  document.getElementById('calcReceived').textContent = peso(amount - interest);
  document.getElementById('calcTerm').textContent     = term + ' month' + (term > 1 ? 's' : '');
  document.getElementById('calcMonthly').textContent  = peso(amount / term);
  document.getElementById('calcTotal').textContent    = peso(amount);
}


function filterUsers(btn, filter) {
  document.querySelectorAll('#adminUsersPage .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderUsersTable(STATE.allUsers, filter);
}
function filterAdminLoans(btn, filter) {
  document.querySelectorAll('#adminLoansPage .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminLoansTable(STATE.allLoans, filter);
}
function searchUsers(q) {
  const f = STATE.allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(q.toLowerCase()) ||
    u.email?.toLowerCase().includes(q.toLowerCase()) ||
    u.username?.toLowerCase().includes(q.toLowerCase())
  );
  renderUsersTable(f, 'all');
}


function updateDbStatus(connected) {
  const dot = document.getElementById('dbDot');
  const txt = document.getElementById('dbStatusText');
  if (!dot || !txt) return;
  dot.className = connected ? 'db-dot connected' : 'db-dot';
  txt.textContent = connected ? 'Connected' : 'Offline';
}


function switchPage(name) {
  document.querySelectorAll('#userApp .page').forEach(p => p.classList.remove('active'));
  document.getElementById(name + 'Page')?.classList.add('active');
  document.querySelectorAll('#userApp .nav-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('onclick')?.includes(`'${name}'`));
  });
  const title = document.getElementById('topbarTitle');
  if (title) title.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  loadUserPage(name);
}

function switchAdminPage(name) {
  document.querySelectorAll('#adminApp .page').forEach(p => p.classList.remove('active'));
  document.getElementById(name + 'Page')?.classList.add('active');
  document.querySelectorAll('#adminApp .nav-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('onclick')?.includes(`'${name}'`));
  });
  const titles = {
    adminDashboard: 'Dashboard', adminUsers: 'User Management',
    adminLoans: 'Loan Management', adminSavings: 'Savings',
    adminBilling: 'Billing', adminEarnings: 'Company Earnings',
    adminBlocked: 'Blocked Emails',
  };
  const title = document.getElementById('adminTopbarTitle');
  if (title) title.textContent = titles[name] || name;
  loadAdminPage(name);
}

async function tryAutoConnect() {
  const url = localStorage.getItem('ls_sb_url');
  const key = localStorage.getItem('ls_sb_key');
  if (!url || !key || !url.includes('supabase.co')) return false;
  try {
    await initSupabase(url, key);
    const { error } = await STATE.supabase.from('profiles').select('id').limit(1);
    if (!error || error.code === 'PGRST116' || error.message?.includes('0 rows')) {
      updateDbStatus(true);

      // Restore session from login page
      const adminFlag = sessionStorage.getItem('ls_admin');
      const userJson  = sessionStorage.getItem('ls_user');

      if (adminFlag === '1') {
        STATE.isAdmin = true;
        launchAdminApp(); return true;
      }
      if (userJson) {
        try {
          const profile = JSON.parse(userJson);
          if (profile?.id) {
            const fresh = await DB.getProfileById(profile.id);
            if (fresh && fresh.status === 'active') {
              STATE.currentUser = fresh;
              launchUserApp(fresh); return true;
            }
          }
        } catch(e) { sessionStorage.removeItem('ls_user'); }
      }
      return false; // not connected/logged in
    }
  } catch(e) { console.warn('Auto-connect failed:', e.message); }
  return false;
}
