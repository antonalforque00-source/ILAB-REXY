/**
 * =====================================================
 * LOANSPHERE — Auth for Dashboard (js/auth.js)
 * Login/Register are separate pages — this handles
 * launching apps from session + logout
 * =====================================================
 */

function launchUserApp(user) {
  const el = document.getElementById('userApp');
  const ad = document.getElementById('adminApp');
  if (el) el.style.display = 'flex';
  if (ad) ad.style.display = 'none';
  const initials = user.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'U';
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user.full_name;
  document.getElementById('sidebarRole').textContent   = user.account_type;
  document.getElementById('dashName').textContent      = user.full_name?.split(' ')[0];
  const isPremium = user.account_type === 'Premium';
  ['premiumNav','savingsNav','moneybackNav'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.style.display = isPremium ? '' : 'none';
  });
  switchPage('dashboard');
}

function launchAdminApp() {
  const el = document.getElementById('userApp');
  const ad = document.getElementById('adminApp');
  if (el) el.style.display = 'none';
  if (ad) ad.style.display = 'flex';
  switchAdminPage('adminDashboard');
}

async function doLogout() {
  try { await DB.signOut(); } catch(e) {}
  STATE.currentUser = null;
  STATE.authUser    = null;
  STATE.isAdmin     = false;
  sessionStorage.removeItem('ls_user');
  sessionStorage.removeItem('ls_admin');
  window.location.href = 'index.html';
}
