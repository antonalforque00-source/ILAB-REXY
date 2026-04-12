# 🏦 LoanSphere — Loan Management System

> **Official Loan Management Portal** — Empowering members through seamless loan processing, savings management, and real-time financial tracking.

---

## 📁 Project Structure

```
LoanSphere/
│
├── 📄 index.html              ← Landing Page (open this first!)
├── 📄 dashboard.html          ← Main App Dashboard
│
├── 📂 pages/
│   ├── login.html             ← User Login (split-screen)
│   ├── register.html          ← User Registration (full form)
│   └── admin-login.html       ← Admin Login (red theme)
│
├── 📂 css/
│   ├── style.css              ← Design System & Variables
│   ├── app.css                ← Dashboard Layout
│   ├── auth.css               ← Auth Pages Layout
│   └── loader.css             ← Page Loader Animation
│
├── 📂 js/
│   ├── db.js                  ← Supabase + All DB Queries
│   ├── utils.js               ← Shared Helpers
│   ├── loader.js              ← Loader Logic
│   ├── auth.js                ← App Launch + Logout
│   ├── user.js                ← User Dashboard Pages
│   └── admin.js               ← Admin Management Pages
│
├── 📂 sql/
│   └── setup.sql              ← Run Once in Supabase
│
├── 📄 .gitignore
└── 📄 README.md
```

---

## 🚀 Setup in 4 Steps

### Step 1 — Create Free Supabase Project
1. Go to **[supabase.com](https://supabase.com)** and sign up free
2. Click **New Project** → Name: `loansphere`
3. Wait 1-2 minutes for project to be ready

### Step 2 — Run the Database SQL
1. Supabase → **SQL Editor** → **New query**
2. Paste the contents of **`sql/setup.sql`**
3. Click **Run** → You will see: *"Success. No rows returned"* ✅

### Step 3 — Get Your API Keys
1. Supabase → **Settings** → **API**
2. Copy your **Project URL** (e.g. `https://abc123.supabase.co`)
3. Copy your **anon / public key** (starts with `eyJ...`)

### Step 4 — Open and Connect
1. Open **`index.html`** in Chrome
2. The Supabase wizard appears → paste your keys → **Connect**
3. Done!

---

## 🔐 Admin Credentials

| Field    | Value                   |
|----------|-------------------------|
| Username | `admin`                 |
| Password | `Admin@LoanSphere2024!` |

> Keep these credentials private. Do not share publicly.

---

## 🔗 Page Navigation Flow

```
index.html  (Landing Page)
    │
    ├── pages/login.html         ← Click "Login"
    │       │
    │       ├── dashboard.html   ← After successful login
    │       └── pages/admin-login.html
    │                 │
    │                 └── dashboard.html (Admin mode)
    │
    └── pages/register.html      ← Click "Register Now"
              │
              └── pages/login.html
```

---

## 📊 Database Tables

| Table            | Description                    |
|------------------|--------------------------------|
| `profiles`       | All registered users           |
| `loans`          | Loan applications              |
| `billing`        | Monthly payment schedules      |
| `savings_txns`   | Savings transactions           |
| `money_back`     | Money back distributions       |
| `earnings`       | Company earnings               |
| `blocked_emails` | Blocked email addresses        |

---

## ✅ Features

**User Dashboard**
- Apply for loans (P5,000-P10,000, 3% interest)
- View billing schedule
- Savings deposits and withdrawals (Premium)
- Money Back distributions (Premium)
- Profile page and transaction history

**Admin Dashboard**
- Approve or reject user registrations
- Approve or reject loan applications
- Process savings withdrawal requests
- Company earnings tracking
- Distribute money back to Premium members
- Block and unblock email addresses

---

## 🎬 Page Loader
Every page shows an intro animation with **CODE NI ALFORQUE** badge.

---

## 🛠 Tech Stack

| Technology   | Usage                     |
|--------------|---------------------------|
| HTML5        | Structure                 |
| CSS3         | Styling and Animations    |
| JavaScript   | Logic and Interactivity   |
| Supabase     | Database and Backend      |
| Google Fonts | Playfair Display + Outfit |

---

**CODE NI ALFORQUE** — LoanSphere 2026
