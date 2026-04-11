/**
 * =====================================================
 * LOANSPHERE v3 — User Pages (js/user.js)
 * =====================================================
 */

async function loadUserPage(name) {
  if (!STATE.currentUser) return;
  switch (name) {
    case 'dashboard':    await loadUserDashboard();    break;
    case 'loans':        await loadUserLoans();        break;
    case 'billing':      await loadUserBilling();      break;
    case 'savings':      await loadUserSavings();      break;
    case 'moneyback':    await loadUserMoneyBack();    break;
    case 'profile':           loadUserProfile();       break;
    case 'transactions': await loadUserTransactions(); break;
  }
}

async function loadUserDashboard() {
  const user = STATE.currentUser;
  try {
    const [loans, billing] = await Promise.all([DB.getLoansByUser(user.id), DB.getBillingByUser(user.id)]);
    const loanBal = loans.filter(l => l.status === 'Approved').reduce((s, l) => s + (l.remaining_balance || 0), 0);
    document.getElementById('dashLoanBal').textContent = peso(loanBal);
    document.getElementById('dashSavings').textContent = peso(user.savings_balance);
    const unpaid = billing.filter(b => b.status !== 'Paid').sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    if (unpaid.length) { document.getElementById('dashDue').textContent = peso(unpaid[0].total_amount); document.getElementById('dashDueDate').textContent = 'Due ' + fmtDate(unpaid[0].due_date); document.getElementById('billingBadge').style.display = ''; }
    else { document.getElementById('billingBadge').style.display = 'none'; }
    const bl = document.getElementById('dashBillingList');
    bl.innerHTML = billing.length ? billing.slice(0,5).map(b => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border)"><div><div style="font-size:.84rem;font-weight:600">${b.period}</div><div style="font-size:.73rem;color:var(--text3)">Due ${fmtDate(b.due_date)}</div></div><div style="text-align:right"><div style="font-weight:600">${peso(b.total_amount)}</div>${statusBadge(b.status)}</div></div>`).join('') : '<div class="empty-state"><div class="es-icon">📭</div><p>No billing records yet.</p></div>';
    const ll = document.getElementById('dashLoanList');
    ll.innerHTML = loans.length ? loans.slice(0,5).map(l => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border)"><div><div style="font-size:.84rem;font-weight:600">${peso(l.amount)}</div><div style="font-size:.73rem;color:var(--text3)">${l.term_months} mo. · ${fmtDate(l.created_at)}</div></div>${statusBadge(l.status)}</div>`).join('') : '<div class="empty-state"><div class="es-icon">📭</div><p>No loans yet.</p></div>';
  } catch (e) { console.error(e); }
}

async function loadUserLoans() {
  const tbody = document.getElementById('userLoansBody');
  try {
    const loans = await DB.getLoansByUser(STATE.currentUser.id);
    if (!loans.length) { tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="es-icon">📭</div><p>No loans yet.</p></div></td></tr>'; return; }
    tbody.innerHTML = loans.map((l, i) => `<tr><td>${i+1}</td><td><strong>${peso(l.amount)}</strong></td><td>${peso(l.amount_received)}</td><td>${l.term_months} mo.</td><td>${peso(l.monthly_payment)}</td><td>${statusBadge(l.status)}</td><td>${fmtDate(l.created_at)}</td></tr>`).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="7" style="color:var(--rose);padding:16px">Error loading loans.</td></tr>'; }
}

async function loadUserBilling() {
  const tbody = document.getElementById('userBillingBody');
  try {
    const b = await DB.getBillingByUser(STATE.currentUser.id);
    if (!b.length) { tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="es-icon">📭</div><p>No billing records.</p></div></td></tr>'; return; }
    tbody.innerHTML = b.map((r, i) => `<tr><td>${i+1}</td><td>${r.period}</td><td>${peso(r.base_amount)}</td><td>${peso(r.interest)}</td><td>${peso(r.penalty)}</td><td><strong>${peso(r.total_amount)}</strong></td><td>${fmtDate(r.due_date)}</td><td>${statusBadge(r.status)}</td></tr>`).join('');
  } catch (e) { console.error(e); }
}

async function loadUserSavings() {
  const user = STATE.currentUser;
  const txns = await DB.getSavingsTxnsByUser(user.id);
  const dep = txns.filter(t => t.category==='Deposit'&&t.status==='Completed').reduce((s,t)=>s+t.amount,0);
  const wit = txns.filter(t => t.category==='Withdrawal'&&t.status==='Completed').reduce((s,t)=>s+t.amount,0);
  document.getElementById('savingsBalance').textContent   = peso(user.savings_balance);
  document.getElementById('savingsTotalDep').textContent  = peso(dep);
  document.getElementById('savingsTotalWith').textContent = peso(wit);
  const tbody = document.getElementById('userSavTxnBody');
  tbody.innerHTML = txns.length ? txns.map((t,i)=>`<tr><td>${i+1}</td><td style="font-size:.73rem;font-family:monospace">${t.txn_id}</td><td>${t.category}</td><td>${peso(t.amount)}</td><td>${fmtDate(t.created_at)}</td><td>${statusBadge(t.status)}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="es-icon">📭</div><p>No transactions yet.</p></div></td></tr>';
}

async function loadUserMoneyBack() {
  const entries = await DB.getMoneyBackByUser(STATE.currentUser.id);
  const total = entries.reduce((s,e)=>s+e.amount,0);
  document.getElementById('mbTotal').textContent = peso(total);
  document.getElementById('mbLast').textContent  = entries.length ? fmtDate(entries[0].created_at) : '—';
  const tbody = document.getElementById('mbBody');
  tbody.innerHTML = entries.length ? entries.map((e,i)=>`<tr><td>${i+1}</td><td><strong>${peso(e.amount)}</strong></td><td>${fmtDate(e.created_at)}</td><td>${e.note||'—'}</td></tr>`).join('') : '<tr><td colspan="4"><div class="empty-state"><div class="es-icon">📭</div><p>No distributions yet.</p></div></td></tr>';
}

function loadUserProfile() {
  const u = STATE.currentUser;
  const initials = u.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'U';
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent   = u.full_name;
  document.getElementById('profileType').textContent   = u.account_type+' Member';
  document.getElementById('profileStatus').innerHTML   = statusBadge(u.status);
  const fields=[['Email',u.email],['Contact',u.contact],['Address',u.address],['Birthday',fmtDate(u.birthday)],['Gender',u.gender||'—'],['Age',u.age],['Bank',u.bank_name],['Account Number',u.bank_account],['TIN',u.tin],['Company',u.company_name],['Position',u.position],['Monthly Salary',peso(u.monthly_salary)]];
  document.getElementById('profileDetails').innerHTML = fields.map(([l,v])=>`<div class="detail-item"><label>${l}</label><p>${v||'—'}</p></div>`).join('');
}

async function loadUserTransactions() {
  const txns = await DB.getSavingsTxnsByUser(STATE.currentUser.id);
  const tbody = document.getElementById('userTxnBody');
  tbody.innerHTML = txns.length ? txns.map((t,i)=>`<tr><td>${i+1}</td><td style="font-size:.73rem;font-family:monospace">${t.txn_id}</td><td>${t.category}</td><td>${peso(t.amount)}</td><td>${fmtDate(t.created_at)}</td><td>${statusBadge(t.status)}</td></tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="es-icon">📭</div><p>No transactions.</p></div></td></tr>';
}

async function submitLoanApplication() {
  const amount = parseFloat(document.getElementById('loanAmountSelect').value);
  const term   = STATE.selectedLoanTerm;
  if (!amount) { toast('Select a loan amount','warn'); return; }
  if (!term)   { toast('Select a payment term','warn'); return; }
  const interest=amount*.03, received=amount-interest, monthly=amount/term;
  try {
    await DB.createLoan({ user_id:STATE.currentUser.id, amount, interest, amount_received:received, term_months:term, monthly_payment:monthly, remaining_balance:amount, status:'Pending', created_at:new Date().toISOString() });
    closeModal('applyLoanModal');
    toast('Loan application submitted! Awaiting admin approval.');
    document.getElementById('loanAmountSelect').value='';
    document.querySelectorAll('#applyLoanModal .filter-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById('loanCalcBox').style.display='none';
    STATE.selectedLoanTerm=null;
  } catch(e){toast(e.message,'err');}
}

async function submitDeposit() {
  const amount=parseFloat(document.getElementById('depositAmount').value);
  if(!amount||amount<100||amount>1000){toast('Amount must be ₱100–₱1,000','warn');return;}
  const user=STATE.currentUser;
  if((user.savings_balance||0)+amount>100000){toast('Max savings is ₱100,000','warn');return;}
  try {
    await DB.createSavingsTxn({user_id:user.id,txn_id:genTxnId(),category:'Deposit',amount,status:'Completed',created_at:new Date().toISOString()});
    const newBal=(user.savings_balance||0)+amount;
    await DB.updateProfile(user.id,{savings_balance:newBal});
    STATE.currentUser.savings_balance=newBal;
    closeModal('depositModal');
    document.getElementById('depositAmount').value='';
    toast('Deposited '+peso(amount)+'!');
    loadUserSavings();
  }catch(e){toast(e.message,'err');}
}

async function submitWithdrawRequest() {
  const amount=parseFloat(document.getElementById('withdrawAmount').value);
  const note=document.getElementById('withdrawNote').value.trim();
  if(!amount||amount<500||amount>5000){toast('Amount must be ₱500–₱5,000','warn');return;}
  const user=STATE.currentUser;
  if(amount>(user.savings_balance||0)){toast('Insufficient savings balance','warn');return;}
  try {
    await DB.createSavingsTxn({user_id:user.id,txn_id:genTxnId(),category:'Withdrawal',amount,note,status:'Pending',created_at:new Date().toISOString()});
    closeModal('withdrawModal');
    document.getElementById('withdrawAmount').value='';
    document.getElementById('withdrawNote').value='';
    toast('Withdrawal request submitted! Awaiting admin approval.');
    loadUserSavings();
  }catch(e){toast(e.message,'err');}
}
