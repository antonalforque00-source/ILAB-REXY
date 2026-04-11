# 🔧 Supabase Setup Guide — Fix All Errors

## ❌ Common Errors and What They Mean

| Error | Cause | Fix |
|-------|-------|-----|
| `TypeError: Failed to fetch` | Wrong URL or key, or tables not set up | Follow Steps 1-4 below |
| `Cannot modify` / `violates row-level security` | RLS is blocking inserts | Re-run setup.sql |
| `permission denied` | Table grants not applied | Re-run setup.sql |
| `foreign key constraint` | Old broken table structure | Re-run setup.sql |
| `401 Unauthorized` | Wrong API key | Check your anon key in Settings → API |

---

## ✅ The CORRECT Way — Pure HTML (NO Node.js needed)

### ⚠️ ChatGPT gave you Node.js code — DO NOT USE IT

ChatGPT showed you this — it is for Node.js apps ONLY:
```
import { createClient } from '@supabase/supabase-js'   ← WRONG for HTML
```

This project uses the CDN version — already built in to db.js:
```
window.supabase.createClient(url, key)   ← CORRECT for HTML
```

You do NOT need:
- Node.js
- npm install
- package.json
- package-lock.json
- Any terminal commands

Just open `index.html` in Chrome and it works!

---

## 📋 Step-by-Step Fix

### STEP 1 — Go to Supabase and open SQL Editor

1. Go to https://supabase.com and log in
2. Click your **loansphere** project
3. In the left sidebar, click **SQL Editor**
4. Click **New query**

---

### STEP 2 — Paste and Run setup.sql

1. Open the file `sql/setup.sql` in Notepad
2. Press **Ctrl+A** to select all text
3. Press **Ctrl+C** to copy
4. Go back to Supabase SQL Editor
5. Click inside the editor box
6. Press **Ctrl+V** to paste
7. Click the green **Run** button
8. You should see: **"Success. No rows returned"** ✅

If you see any error, scroll down for troubleshooting.

---

### STEP 3 — Get your API Keys

1. In Supabase left sidebar, click **Settings** (gear icon at bottom)
2. Click **API**
3. Under **Project URL** — copy the URL (looks like `https://abc123.supabase.co`)
4. Under **Project API Keys** — copy the **anon / public** key (starts with `eyJ...`)
5. Keep these two values ready

---

### STEP 4 — Connect LoanSphere

1. Open `index.html` in Chrome
2. The setup wizard appears
3. Paste your **Project URL** in the first box
4. Paste your **anon key** in the second box
5. Click **Connect to Database & Launch LoanSphere**
6. You should see: **"Connected! Launching LoanSphere..."** ✅

---

### STEP 5 — Test Registration

1. Click **Register Now**
2. Fill in the form completely
3. Click **Submit Registration**
4. You should see: **"Registration submitted! Awaiting admin approval."** ✅

---

## 🔍 Troubleshooting

### "TypeError: Failed to fetch"

This means the browser cannot reach Supabase. Check:

**1. Is your Project URL correct?**
- Open Supabase → Settings → API
- Copy the URL exactly — it must start with `https://`
- Must end with `.supabase.co`
- Example: `https://abcdefghij.supabase.co`

**2. Is your anon key correct?**
- Must start with `eyJ`
- Must be the **anon/public** key (NOT the service_role key)
- Copy the whole key — it is very long

**3. Did you run setup.sql?**
- If you skip this step, you get "Failed to fetch"
- Go to Supabase → SQL Editor → run setup.sql

**4. Check your internet connection**
- The app needs internet to reach Supabase

---

### "Cannot modify" or "violates row-level security"

This means the SQL setup was not run correctly.

Fix: Go to Supabase → SQL Editor → New query → paste setup.sql → Run

---

### "401 Unauthorized"

This means your API key is wrong.

Fix:
1. Supabase → Settings → API
2. Copy the **anon / public** key again
3. Open LoanSphere → setup wizard → paste the key again

---

### "duplicate key value violates unique constraint"

This is normal — it means the email or username is already registered.

The error message in the app will say:
- "This email is already registered"
- "This username is already taken"

---

## 📊 Verify Tables Were Created

After running setup.sql, check in Supabase:
1. Click **Table Editor** in the left sidebar
2. You should see 7 tables:
   - profiles
   - loans
   - billing
   - savings_txns
   - money_back
   - earnings
   - blocked_emails

If you see these 7 tables, the setup worked! ✅

---

## 🔐 Admin Login

After connecting:
1. Go to `pages/admin-login.html`
2. Username: `admin`
3. Password: `Admin@LoanSphere2024!`

---

## ❓ Why NOT to use the ChatGPT Code

The code ChatGPT gave you is for a **Node.js server app**. This project is a **static HTML website**. They are completely different:

| ChatGPT Code (Node.js) | This Project (HTML) |
|------------------------|---------------------|
| Needs npm install | No installation needed |
| Needs package.json | No package.json |
| Runs on a server | Opens in Chrome |
| import { createClient } | window.supabase.createClient |
| fetch() with headers | Supabase JS client handles it |

Everything ChatGPT described is already built into `js/db.js` correctly for HTML.

---

*CODE NI ALFORQUE — LoanSphere 2026*
