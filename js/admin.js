
async function loadAdminPage(name) {
  switch(name) {
    case 'adminDashboard': await loadAdminDashboard();  break;
    case 'adminUsers':     await loadAdminUsers();      break;
    case 'adminLoans':     await loadAdminLoansPage();  break;
    case 'adminSavings':   await loadAdminSavings();    break;
    case 'adminBilling':   await loadAdminBilling();    break;
    case 'adminEarnings':  await loadAdminEarnings();   break;
    case 'adminBlocked':   await loadAdminBlocked();    break;
  }
}

async function loadAdminDashboard() {
  try {
    const [users, loans] = await Promise.all([DB.getAllProfilesWithEmail(), DB.getAllLoans()]);
    STATE.allUsers = users;
    STATE.allLoans = loans;
    const active=users.filter(u=>u.status==='active');
    const activeLoans=loans.filter(l=>l.status==='Approved');
    const pReg=users.filter(u=>u.status==='pending');
    const pLoan=loans.filter(l=>l.status==='Pending');
    const totalSav=users.reduce((s,u)=>s+(u.savings_balance||0),0);
    document.getElementById('aStatUsers').textContent    = active.length;
    document.getElementById('aStatLoans').textContent    = activeLoans.length;
    document.getElementById('aStatPending').textContent  = pReg.length+pLoan.length;
    document.getElementById('aStatSavings').textContent  = peso(totalSav);
    document.getElementById('pendingRegBadge').textContent  = pReg.length;
    document.getElementById('pendingLoanBadge').textContent = pLoan.length;

    const rBody=document.getElementById('aPendingRegBody');
    rBody.innerHTML=pReg.length?pReg.map(u=>`<tr><td><strong>${u.full_name}</strong></td><td>${u.account_type}</td><td>${fmtDate(u.created_at)}</td><td><button class="btn btn-xs btn-outline-success" onclick="approveUser('${u.id}')">✅ Approve</button> <button class="btn btn-xs btn-outline-danger" onclick="disableUser('${u.id}')">❌ Reject</button></td></tr>`).join(''):'<tr><td colspan="4"><div class="empty-state"><div class="es-icon">✅</div><p>None pending.</p></div></td></tr>';

    const lBody=document.getElementById('aPendingLoanBody');
    lBody.innerHTML=pLoan.length?pLoan.map(l=>`<tr><td><strong>${l.profiles?.full_name||'?'}</strong></td><td>${peso(l.amount)}</td><td>${l.term_months} mo.</td><td><button class="btn btn-xs btn-outline-success" onclick="approveLoan('${l.id}')">✅</button> <button class="btn btn-xs btn-outline-danger" onclick="openRejectLoan('${l.id}')">❌</button></td></tr>`).join(''):'<tr><td colspan="4"><div class="empty-state"><div class="es-icon">✅</div><p>None pending.</p></div></td></tr>';
  } catch(e){console.error(e);}
}

async function loadAdminUsers() {
  try { const users=await DB.getAllProfilesWithEmail(); STATE.allUsers=users; renderUsersTable(users,'all'); } catch(e){console.error(e);}
}

function renderUsersTable(users, filter) {
  const filtered=filter==='all'?users:users.filter(u=>u.status===filter);
  const tbody=document.getElementById('adminUsersBody');
  if(!filtered.length){tbody.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="es-icon">📭</div><p>No users found.</p></div></td></tr>';return;}
  tbody.innerHTML=filtered.map((u,i)=>`<tr>
    <td>${i+1}</td>
    <td><strong>${u.full_name}</strong><br><span style="font-size:.73rem;color:var(--text3)">@${u.username||'—'}</span></td>
    <td><span class="status ${u.account_type==='Premium'?'status-approved':'status-paid'}">${u.account_type}</span></td>
    <td style="font-size:.8rem">${u.email||'—'}</td>
    <td>${statusBadge(u.status)}</td>
    <td style="font-size:.78rem">${fmtDate(u.created_at)}</td>
    <td>
      <button class="btn btn-xs btn-secondary" onclick="viewUserDetail('${u.id}')">👁 View</button>
      ${u.status==='pending'  ?`<button class="btn btn-xs btn-outline-success" onclick="approveUser('${u.id}')">✅ Approve</button>`:'' }
      ${u.status==='active'   ?`<button class="btn btn-xs btn-outline-danger"  onclick="disableUser('${u.id}')">🚫 Disable</button>`:''}
      ${u.status==='disabled' ?`<button class="btn btn-xs btn-outline-success" onclick="approveUser('${u.id}')">🔓 Enable</button>`:''}
    </td>
  </tr>`).join('');
}

async function approveUser(id) {
  try { await DB.updateProfile(id,{status:'active'}); toast('User approved!'); loadAdminDashboard(); if(document.getElementById('adminUsersPage')?.classList.contains('active'))loadAdminUsers(); } catch(e){toast(e.message,'err');}
}
async function disableUser(id) {
  if(!confirm('Disable/reject this user?'))return;
  try { await DB.updateProfile(id,{status:'disabled'}); toast('User disabled.'); loadAdminDashboard(); if(document.getElementById('adminUsersPage')?.classList.contains('active'))loadAdminUsers(); } catch(e){toast(e.message,'err');}
}

async function viewUserDetail(id) {
  const user=STATE.allUsers.find(u=>u.id===id);
  if(!user){toast('User not found','err');return;}
  const fields=[
    ['Full Name',user.full_name],['Username',user.username||'—'],
    ['Email',user.email||'—'],['Account Type',user.account_type],
    ['Status',user.status],['Gender',user.gender||'—'],
    ['Birthday',fmtDate(user.birthday)],['Age',user.age],
    ['Contact',user.contact],['Address',user.address],
    ['Bank',user.bank_name],['Account Number',user.bank_account],
    ['Cardholder',user.card_holder],['TIN',user.tin],
    ['Company',user.company_name],['Position',user.position],
    ['Monthly Salary',peso(user.monthly_salary)],
    ['Savings Balance',peso(user.savings_balance)],
    ['Applied',fmtDate(user.created_at)]
  ];
  document.getElementById('userDetailContent').innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px 22px">${fields.map(([l,v])=>`<div class="detail-item"><label>${l}</label><p>${v||'—'}</p></div>`).join('')}</div>`;
  showModal('userDetailModal');
}

async function loadAdminLoansPage() {
  try { const loans=await DB.getAllLoans(); STATE.allLoans=loans; renderAdminLoansTable(loans,'all'); } catch(e){console.error(e);}
}

function renderAdminLoansTable(loans, filter) {
  const filtered=filter==='all'?loans:loans.filter(l=>l.status===filter);
  const tbody=document.getElementById('adminLoansBody');
  if(!filtered.length){tbody.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="es-icon">📭</div><p>No loans found.</p></div></td></tr>';return;}
  tbody.innerHTML=filtered.map((l,i)=>`<tr>
    <td>${i+1}</td><td><strong>${l.profiles?.full_name||'?'}</strong></td>
    <td>${peso(l.amount)}</td><td>${l.term_months} mo.</td>
    <td>${fmtDate(l.created_at)}</td><td>${statusBadge(l.status)}</td>
    <td>${l.status==='Pending'?`<button class="btn btn-xs btn-outline-success" onclick="approveLoan('${l.id}')">✅ Approve</button> <button class="btn btn-xs btn-outline-danger" onclick="openRejectLoan('${l.id}')">❌ Reject</button>`:'—'}</td>
  </tr>`).join('');
}

async function approveLoan(id) {
  try {
    const loans=await DB.getAllLoans(); const loan=loans.find(l=>l.id===id); if(!loan)return;
    await DB.updateLoan(id,{status:'Approved',approved_at:new Date().toISOString()});
    const records=[];
    for(let i=1;i<=loan.term_months;i++){const d=new Date();d.setMonth(d.getMonth()+i);records.push({user_id:loan.user_id,loan_id:id,period:'Month '+i,base_amount:loan.monthly_payment,interest:0,penalty:0,total_amount:loan.monthly_payment,due_date:d.toISOString().split('T')[0],status:'Unpaid',created_at:new Date().toISOString()});}
    await DB.createBillingRecords(records);
    toast('Loan approved! Billing records generated.');
    loadAdminDashboard();
    if(document.getElementById('adminLoansPage')?.classList.contains('active'))loadAdminLoansPage();
  }catch(e){toast(e.message,'err');}
}

function openRejectLoan(id){STATE.pendingRejectLoanId=id;document.getElementById('rejectReason').value='';showModal('rejectLoanModal');}
async function confirmRejectLoan(){
  const reason=document.getElementById('rejectReason').value.trim();
  if(!reason){toast('Enter a reason','warn');return;}
  try{await DB.updateLoan(STATE.pendingRejectLoanId,{status:'Rejected',reject_reason:reason});closeModal('rejectLoanModal');toast('Loan rejected.');loadAdminDashboard();if(document.getElementById('adminLoansPage')?.classList.contains('active'))loadAdminLoansPage();}catch(e){toast(e.message,'err');}
}

async function loadAdminSavings() {
  try {
    const txns=await DB.getAllSavingsTxns();
    const pending=txns.filter(t=>t.category==='Withdrawal'&&t.status==='Pending');
    const wb=document.getElementById('adminWithdrawBody');
    wb.innerHTML=pending.length?pending.map((t,i)=>`<tr><td>${i+1}</td><td>${t.profiles?.full_name||'?'}</td><td>${peso(t.amount)}</td><td>${fmtDate(t.created_at)}</td><td>${statusBadge(t.status)}</td><td><button class="btn btn-xs btn-outline-success" onclick="approveWithdraw('${t.id}','${t.user_id}',${t.amount})">✅</button> <button class="btn btn-xs btn-outline-danger" onclick="rejectWithdraw('${t.id}')">❌</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state"><div class="es-icon">📭</div><p>No requests.</p></div></td></tr>';
    const sb=document.getElementById('adminSavTxnBody');
    sb.innerHTML=txns.length?txns.map((t,i)=>`<tr><td>${i+1}</td><td style="font-size:.72rem;font-family:monospace">${t.txn_id}</td><td>${t.profiles?.full_name||'?'}</td><td>${t.category}</td><td>${peso(t.amount)}</td><td>${fmtDate(t.created_at)}</td><td>${statusBadge(t.status)}</td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-state"><div class="es-icon">📭</div><p>No transactions.</p></div></td></tr>';
  }catch(e){console.error(e);}
}

async function approveWithdraw(txnId,userId,amount) {
  try {
    const profile=await DB.getProfileById(userId); if(!profile)return;
    const newBal=Math.max(0,(profile.savings_balance||0)-amount);
    await DB.updateProfile(userId,{savings_balance:newBal});
    await DB.updateSavingsTxn(txnId,{status:'Completed'});
    toast('Withdrawal approved!'); loadAdminSavings();
  }catch(e){toast(e.message,'err');}
}
async function rejectWithdraw(txnId){try{await DB.updateSavingsTxn(txnId,{status:'Rejected'});toast('Withdrawal rejected.');loadAdminSavings();}catch(e){toast(e.message,'err');}}

async function loadAdminBilling() {
  try{const b=await DB.getAllBilling();const tbody=document.getElementById('adminBillingBody');tbody.innerHTML=b.length?b.map(r=>`<tr><td><strong>${r.profiles?.full_name||'?'}</strong></td><td>${r.period}</td><td>${peso(r.base_amount)}</td><td>${peso(r.interest)}</td><td>${peso(r.penalty)}</td><td><strong>${peso(r.total_amount)}</strong></td><td>${fmtDate(r.due_date)}</td><td>${statusBadge(r.status)}</td></tr>`).join(''):'<tr><td colspan="8"><div class="empty-state"><div class="es-icon">📭</div><p>No records.</p></div></td></tr>';}catch(e){console.error(e);}
}

async function loadAdminEarnings() {
  try {
    const e=await DB.getAllEarnings();const total=e.reduce((s,x)=>s+x.amount,0);const pool=total*.02;const cnt=await DB.getPremiumCount();const per=cnt>0?pool/cnt:0;
    document.getElementById('aEarnTotal').textContent=peso(total);document.getElementById('aEarnPool').textContent=peso(pool);document.getElementById('aEarnMembers').textContent=cnt;document.getElementById('aEarnPerMember').textContent=peso(per);
    const tbody=document.getElementById('earningsBody');tbody.innerHTML=e.length?e.map((x,i)=>`<tr><td>${i+1}</td><td>${x.description}</td><td><strong>${peso(x.amount)}</strong></td><td>${fmtDate(x.created_at)}</td></tr>`).join(''):'<tr><td colspan="4"><div class="empty-state"><div class="es-icon">📭</div><p>No entries.</p></div></td></tr>';
  }catch(e){console.error(e);}
}

async function addEarnings(){
  const d=document.getElementById('earningDesc').value.trim();
  const a=parseFloat(document.getElementById('earningAmount').value);
  if(!d){toast('Please enter a description.','warn');return;}
  if(!a||a<=0){toast('Please enter a valid amount.','warn');return;}
  try{
    await DB.createEarning({description:d,amount:a,created_at:new Date().toISOString()});
    closeModal('addEarningsModal');
    document.getElementById('earningDesc').value='';
    document.getElementById('earningAmount').value='';
    toast('Earnings entry added successfully!');
    loadAdminEarnings();
  }catch(e){
    toast(e.message||'Failed to add entry.','err');
  }
}

async function distributeMoneyBack(){
  if(!confirm('Distribute money back to all active Premium members?'))return;
  try{
    const earnings=await DB.getAllEarnings();const total=earnings.reduce((s,x)=>s+x.amount,0);const pool=total*.02;
    const users=await DB.getAllProfilesWithEmail();const premiums=users.filter(u=>u.status==='active'&&u.account_type==='Premium');
    if(!premiums.length){toast('No active Premium members','warn');return;}
    const share=pool/premiums.length;
    for(const u of premiums)await DB.createMoneyBack({user_id:u.id,amount:share,note:'Annual distribution',created_at:new Date().toISOString()});
    toast('Distributed '+peso(share)+' to each Premium member!');loadAdminEarnings();
  }catch(e){toast(e.message,'err');}
}

async function loadAdminBlocked(){
  const tbody=document.getElementById('blockedEmailsBody');
  try{
    const list=await DB.getBlockedEmails();
    tbody.innerHTML=list.length?list.map((x,i)=>`<tr><td>${i+1}</td><td style="font-weight:600">${x.email}</td><td>${x.reason||'—'}</td><td>${fmtDate(x.created_at)}</td><td><button class="btn btn-xs btn-outline-danger" onclick="unblockEmail('${x.id}')">🗑 Remove</button></td></tr>`).join(''):'<tr><td colspan="5"><div class="empty-state"><div class="es-icon">✅</div><p>No blocked emails.</p></div></td></tr>';
  }catch(e){tbody.innerHTML='<tr><td colspan="5" style="color:var(--rose);padding:16px">⚠️ Error loading blocked emails. Make sure you ran setup.sql.</td></tr>';}
}

async function confirmBlockEmail(){
  const emailInput=document.getElementById('blockEmailInput');const reasonInput=document.getElementById('blockReasonInput');
  const email=emailInput.value.trim().toLowerCase();const reason=reasonInput.value.trim();
  if(!email){toast('Enter an email address','warn');return;}
  if(!reason){toast('Enter a reason','warn');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Enter a valid email address','warn');return;}
  try{
    await DB.addBlockedEmail({email,reason,created_at:new Date().toISOString()});
    closeModal('blockEmailModal');emailInput.value='';reasonInput.value='';
    toast(''+email+' has been blocked!');loadAdminBlocked();
  }catch(e){toast((e.message||'Failed to block email.'),'err');}
}

async function unblockEmail(id){if(!confirm('Remove from block list?'))return;try{await DB.deleteBlockedEmail(id);toast('Email unblocked.');loadAdminBlocked();}catch(e){toast(e.message,'err');}}
