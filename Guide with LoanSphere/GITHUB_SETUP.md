

## STEP 1 — Install Git (if not installed)

Download from: https://git-scm.com/downloads
Install with default settings. Then open **Git Bash**.



## STEP 2 — Create a GitHub Account (if you don't have one)

Go to: https://github.com
Click **Sign up** and create a free account.

---

## STEP 3 — Create a New Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `LoanSphere`
   - **Description:** `Loan Management System - CODE NI ALFORQUE`
   - **Visibility:** Public (or Private — your choice)
   - **DO NOT** check "Add a README file"
3. Click **Create repository**
4. Copy the repository URL shown (looks like):
   `https://github.com/YOUR-USERNAME/LoanSphere.git`

---

## STEP 4 — Open Git Bash in Your LoanSphere Folder

**Option A — Right-click method:**
1. Open your **LoanSphere folder** in File Explorer
2. Right-click inside the folder
3. Click **"Open Git Bash here"**

**Option B — Navigate manually:**
```bash
cd C:/Users/YourName/Desktop/LoanSphere
```
*(Change the path to wherever your LoanSphere folder is)*

---

## STEP 5 — Configure Git (first time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Replace with your actual name and GitHub email.

---

## STEP 6 — Initialize and Push to GitHub

Copy and paste these commands **one by one** in Git Bash:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit - LoanSphere Loan Management System"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/LoanSphere.git
```
*(Replace YOUR-USERNAME with your actual GitHub username)*

```bash
git push -u origin main
```

---

## STEP 7 — Enter Your GitHub Credentials

When asked:
- **Username:** your GitHub username
- **Password:** use a **Personal Access Token** (NOT your GitHub password)

### How to create a Personal Access Token:
1. GitHub → Your profile photo → **Settings**
2. Scroll down → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Note: `LoanSphere Push`
6. Check **repo** checkbox
7. Click **Generate token**
8. **Copy the token** (you will not see it again!)
9. Paste it as your password in Git Bash

---

## STEP 8 — Verify It Worked

Go to: `https://github.com/YOUR-USERNAME/LoanSphere`

You should see all your files listed there!

---

## For Future Updates

Every time you make changes, run these 3 commands:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Quick Reference — All Commands in Order

```bash
git init
git add .
git commit -m "Initial commit - LoanSphere Loan Management System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/LoanSphere.git
git push -u origin main
```

---

## Common Errors and Fixes

**Error: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/LoanSphere.git
```

**Error: "failed to push some refs"**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**Error: "Authentication failed"**
- Make sure you are using a Personal Access Token, not your password
- Go to GitHub Settings → Developer Settings → Tokens → Generate new

---

*CODE NI ALFORQUE — LoanSphere 2026*
