
const STATE = {
  supabase:            null,
  currentUser:         null,
  authUser:            null,
  isAdmin:             false,
  selectedLoanTerm:    null,
  pendingRejectLoanId: null,
  allUsers:            [],
  allLoans:            [],
};


function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Supabase SDK. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

async function initSupabase(url, key) {

  if (!url || !url.includes('supabase.co')) {
    throw new Error('Invalid Supabase URL. Must contain "supabase.co"');
  }
  if (!key || key.length < 20) {
    throw new Error('Invalid Supabase API key. Check your anon/public key.');
  }


  await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');


  STATE.supabase = window.supabase.createClient(url.trim(), key.trim(), {
    auth: {
      autoRefreshToken: true,
      persistSession:   true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'apikey':        key.trim(),
        'Authorization': 'Bearer ' + key.trim(),
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
    },
  });

  return STATE.supabase;
}


async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}


function handleDbError(error, tableName) {
  if (!error) return;
  const msg = error.message || error.toString() || '';
  const code = error.code || '';


  if (code === 'PGRST116') return;


  if (msg.includes('foreign key') || msg.includes('_fkey') || msg.includes('violates')) {
    throw new Error(
      `Table "${tableName}" has a broken structure from an old version. ` +
      `Please re-run sql/setup.sql in Supabase → SQL Editor to fix it permanently.`
    );
  }


  if (msg.includes('new row violates') || msg.includes('permission denied') || code === '42501') {
    throw new Error(
      `Permission denied on table "${tableName}". ` +
      `Please re-run sql/setup.sql in Supabase to fix the access policies.`
    );
  }


  if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
    throw new Error(
      `Cannot connect to Supabase. Please check:\n` +
      `1. Your Project URL is correct (Settings → API)\n` +
      `2. Your anon key is correct (Settings → API)\n` +
      `3. Your internet connection is working\n` +
      `4. You ran sql/setup.sql in Supabase SQL Editor`
    );
  }

  throw new Error(msg || `Database error on "${tableName}"`);
}


const DB = {
  sb() {
    if (!STATE.supabase) throw new Error('Database not connected. Please complete the setup wizard.');
    return STATE.supabase;
  },


  async registerUser(data) {
    const hashedPw = await hashPassword(data.password);
    const row = {
      account_type:    data.account_type,
      full_name:       data.full_name,
      gender:          data.gender   || null,
      address:         data.address,
      birthday:        data.birthday || null,
      age:             data.age      || 0,
      contact:         data.contact,
      email:           data.email.toLowerCase().trim(),
      username:        data.username,
      password_hash:   hashedPw,
      bank_name:       data.bank_name,
      bank_account:    data.bank_account,
      card_holder:     data.card_holder,
      tin:             data.tin,
      company_name:    data.company_name,
      company_address: data.company_address,
      company_phone:   data.company_phone,
      position:        data.position,
      monthly_salary:  data.monthly_salary || 0,
      savings_balance: 0,
      role:            'user',
      status:          'pending',
      created_at:      new Date().toISOString(),
    };

    const { data: result, error } = await this.sb()
      .from('profiles')
      .insert([row])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('email'))    throw new Error('This email is already registered. Please log in instead.');
        if (error.message.includes('username')) throw new Error('This username is already taken. Please choose another.');
        throw new Error('This email or username is already in use.');
      }
      handleDbError(error, 'profiles');
    }
    return result;
  },


  async loginUser(email, password) {
    const hashedPw = await hashPassword(password);
    const { data, error } = await this.sb()
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') handleDbError(error, 'profiles');
    if (!data) return null;
    if (data.password_hash !== hashedPw) return null;
    return data;
  },

  async signOut() {
    try { await this.sb().auth.signOut(); } catch(e) {}
  },


  async getProfileById(id) {
    const { data, error } = await this.sb()
      .from('profiles').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') handleDbError(error, 'profiles');
    return data || null;
  },

  async getProfileByEmail(email) {
    const { data } = await this.sb()
      .from('profiles').select('*')
      .eq('email', email.toLowerCase().trim()).single();
    return data || null;
  },

  async getProfileByUsername(username) {
    const { data } = await this.sb()
      .from('profiles').select('*').eq('username', username).single();
    return data || null;
  },

  async updateProfile(id, updates) {
    const { data, error } = await this.sb()
      .from('profiles').update(updates).eq('id', id).select().single();
    if (error) handleDbError(error, 'profiles');
    return data;
  },

  async getAllProfilesWithEmail() {
    const { data, error } = await this.sb()
      .from('profiles').select('*').order('created_at', { ascending: false });
    if (error) handleDbError(error, 'profiles');
    return data || [];
  },

  async getPremiumCount() {
    const { count, error } = await this.sb()
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_type', 'Premium').eq('status', 'active');
    if (error) handleDbError(error, 'profiles');
    return count || 0;
  },


  async isEmailBlocked(email) {
    try {
      const { data } = await this.sb()
        .from('blocked_emails').select('id')
        .eq('email', email.toLowerCase().trim());
      return data && data.length > 0;
    } catch(e) { return false; }
  },

  async addBlockedEmail(entry) {
    const { data, error } = await this.sb()
      .from('blocked_emails')
      .insert([{ ...entry, email: entry.email.toLowerCase().trim() }])
      .select().single();
    if (error) {
      if (error.code === '23505') throw new Error('This email is already in the block list.');
      handleDbError(error, 'blocked_emails');
    }
    return data;
  },

  async getBlockedEmails() {
    const { data, error } = await this.sb()
      .from('blocked_emails').select('*').order('created_at', { ascending: false });
    if (error) handleDbError(error, 'blocked_emails');
    return data || [];
  },

  async deleteBlockedEmail(id) {
    const { error } = await this.sb().from('blocked_emails').delete().eq('id', id);
    if (error) handleDbError(error, 'blocked_emails');
  },


  async createLoan(d) {
    const { data, error } = await this.sb()
      .from('loans').insert([d]).select().single();
    if (error) handleDbError(error, 'loans');
    return data;
  },

  async getLoansByUser(id) {
    const { data } = await this.sb()
      .from('loans').select('*').eq('user_id', id)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getAllLoans() {
    const { data, error } = await this.sb()
      .from('loans')
      .select('*, profiles(full_name, username, email)')
      .order('created_at', { ascending: false });
    if (error) handleDbError(error, 'loans');
    return data || [];
  },

  async updateLoan(id, d) {
    const { data, error } = await this.sb()
      .from('loans').update(d).eq('id', id).select().single();
    if (error) handleDbError(error, 'loans');
    return data;
  },


  async getBillingByUser(id) {
    const { data } = await this.sb()
      .from('billing').select('*').eq('user_id', id)
      .order('due_date', { ascending: false });
    return data || [];
  },

  async getAllBilling() {
    const { data } = await this.sb()
      .from('billing').select('*, profiles(full_name, email)')
      .order('due_date', { ascending: false });
    return data || [];
  },

  async createBillingRecords(records) {
    const { error } = await this.sb().from('billing').insert(records);
    if (error) handleDbError(error, 'billing');
  },

  /* ── SAVINGS TRANSACTIONS ── */
  async createSavingsTxn(d) {
    const { data, error } = await this.sb()
      .from('savings_txns').insert([d]).select().single();
    if (error) handleDbError(error, 'savings_txns');
    return data;
  },

  async getSavingsTxnsByUser(id) {
    const { data } = await this.sb()
      .from('savings_txns').select('*').eq('user_id', id)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async getAllSavingsTxns() {
    const { data } = await this.sb()
      .from('savings_txns').select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async updateSavingsTxn(id, d) {
    const { error } = await this.sb()
      .from('savings_txns').update(d).eq('id', id);
    if (error) handleDbError(error, 'savings_txns');
  },


  async createMoneyBack(d) {
    const { error } = await this.sb().from('money_back').insert([d]);
    if (error) handleDbError(error, 'money_back');
  },

  async getMoneyBackByUser(id) {
    const { data } = await this.sb()
      .from('money_back').select('*').eq('user_id', id)
      .order('created_at', { ascending: false });
    return data || [];
  },


  async getAllEarnings() {
    const { data } = await this.sb()
      .from('earnings').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async createEarning(d) {
    const { data, error } = await this.sb()
      .from('earnings').insert([d]).select().single();
    if (error) handleDbError(error, 'earnings');
    return data;
  },
};
