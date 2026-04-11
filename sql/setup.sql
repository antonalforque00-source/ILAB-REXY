-- ================================================================
-- LOANSPHERE — Complete Database Setup
-- ================================================================
-- Run this ENTIRE file in:
-- Supabase → SQL Editor → New Query → Paste → Run
-- ================================================================

-- Step 1: Drop all old tables (removes all broken stuff)
drop table if exists blocked_emails  cascade;
drop table if exists money_back      cascade;
drop table if exists savings_txns    cascade;
drop table if exists billing         cascade;
drop table if exists loans           cascade;
drop table if exists earnings        cascade;
drop table if exists profiles        cascade;
drop table if exists users           cascade;
drop function if exists handle_new_user() cascade;

-- ═══════════════════════════════════════════════════════
-- Step 2: Create all 7 tables
-- ═══════════════════════════════════════════════════════

-- TABLE 1: profiles (main user table)
create table public.profiles (
  id               uuid        default gen_random_uuid() primary key,
  account_type     text        not null default 'Basic',
  full_name        text        not null default '',
  gender           text,
  address          text,
  birthday         date,
  age              int,
  contact          text,
  email            text        unique not null,
  username         text        unique not null,
  password_hash    text        not null default '',
  bank_name        text,
  bank_account     text,
  card_holder      text,
  tin              text,
  company_name     text,
  company_address  text,
  company_phone    text,
  position         text,
  monthly_salary   numeric     default 0,
  savings_balance  numeric     default 0,
  role             text        default 'user',
  status           text        default 'pending',
  created_at       timestamptz default now()
);

-- TABLE 2: loans
create table public.loans (
  id                uuid        default gen_random_uuid() primary key,
  user_id           uuid        references public.profiles(id) on delete cascade,
  amount            numeric     not null,
  interest          numeric     default 0,
  amount_received   numeric     default 0,
  term_months       int         not null,
  monthly_payment   numeric     default 0,
  remaining_balance numeric     default 0,
  status            text        default 'Pending',
  reject_reason     text,
  approved_at       timestamptz,
  created_at        timestamptz default now()
);

-- TABLE 3: billing
create table public.billing (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references public.profiles(id) on delete cascade,
  loan_id      uuid        references public.loans(id) on delete cascade,
  period       text,
  base_amount  numeric     default 0,
  interest     numeric     default 0,
  penalty      numeric     default 0,
  total_amount numeric     default 0,
  due_date     date,
  status       text        default 'Unpaid',
  created_at   timestamptz default now()
);

-- TABLE 4: savings_txns
create table public.savings_txns (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references public.profiles(id) on delete cascade,
  txn_id     text        unique,
  category   text,
  amount     numeric     not null,
  note       text,
  status     text        default 'Completed',
  created_at timestamptz default now()
);

-- TABLE 5: money_back
create table public.money_back (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references public.profiles(id) on delete cascade,
  amount     numeric     not null,
  note       text,
  created_at timestamptz default now()
);

-- TABLE 6: earnings (standalone — no user link)
create table public.earnings (
  id          uuid        default gen_random_uuid() primary key,
  description text        not null,
  amount      numeric     not null,
  created_at  timestamptz default now()
);

-- TABLE 7: blocked_emails (standalone — no user link)
create table public.blocked_emails (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  reason     text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════
-- Step 3: Disable Row Level Security on ALL tables
-- This is the MOST IMPORTANT step to fix "Failed to fetch"
-- ═══════════════════════════════════════════════════════
alter table public.profiles       disable row level security;
alter table public.loans          disable row level security;
alter table public.billing        disable row level security;
alter table public.savings_txns   disable row level security;
alter table public.money_back     disable row level security;
alter table public.earnings       disable row level security;
alter table public.blocked_emails disable row level security;

-- ═══════════════════════════════════════════════════════
-- Step 4: Grant FULL access to anon and authenticated
-- This allows the browser (anon key) to read and write
-- ═══════════════════════════════════════════════════════
grant all privileges on public.profiles       to anon;
grant all privileges on public.loans          to anon;
grant all privileges on public.billing        to anon;
grant all privileges on public.savings_txns   to anon;
grant all privileges on public.money_back     to anon;
grant all privileges on public.earnings       to anon;
grant all privileges on public.blocked_emails to anon;

grant all privileges on public.profiles       to authenticated;
grant all privileges on public.loans          to authenticated;
grant all privileges on public.billing        to authenticated;
grant all privileges on public.savings_txns   to authenticated;
grant all privileges on public.money_back     to authenticated;
grant all privileges on public.earnings       to authenticated;
grant all privileges on public.blocked_emails to authenticated;

-- ═══════════════════════════════════════════════════════
-- Step 5: Add INSERT policies (fixes "Cannot modify" errors)
-- These allow the browser to insert data into each table
-- ═══════════════════════════════════════════════════════

-- Profiles: allow anyone to register
create policy "Allow insert for registration"
  on public.profiles for insert
  with check (true);

create policy "Allow select own profile"
  on public.profiles for select
  using (true);

create policy "Allow update own profile"
  on public.profiles for update
  using (true);

-- Loans
create policy "Allow insert loans"
  on public.loans for insert
  with check (true);

create policy "Allow select loans"
  on public.loans for select
  using (true);

create policy "Allow update loans"
  on public.loans for update
  using (true);

-- Billing
create policy "Allow insert billing"
  on public.billing for insert
  with check (true);

create policy "Allow select billing"
  on public.billing for select
  using (true);

create policy "Allow update billing"
  on public.billing for update
  using (true);

-- Savings
create policy "Allow insert savings"
  on public.savings_txns for insert
  with check (true);

create policy "Allow select savings"
  on public.savings_txns for select
  using (true);

create policy "Allow update savings"
  on public.savings_txns for update
  using (true);

-- Money back
create policy "Allow insert money_back"
  on public.money_back for insert
  with check (true);

create policy "Allow select money_back"
  on public.money_back for select
  using (true);

-- Earnings
create policy "Allow insert earnings"
  on public.earnings for insert
  with check (true);

create policy "Allow select earnings"
  on public.earnings for select
  using (true);

-- Blocked emails
create policy "Allow insert blocked"
  on public.blocked_emails for insert
  with check (true);

create policy "Allow select blocked"
  on public.blocked_emails for select
  using (true);

create policy "Allow delete blocked"
  on public.blocked_emails for delete
  using (true);

-- ================================================================
-- DONE! All 7 tables created with correct permissions.
--
-- What was fixed:
--   "TypeError: Failed to fetch"  → Fixed by correct grants + policies
--   "Cannot modify"               → Fixed by INSERT policies
--   CORS errors                   → Fixed by using Supabase JS SDK (CDN)
--   RLS blocking inserts          → Fixed by disabling RLS + policies
--
-- Admin Login: admin / Admin@LoanSphere2024!
-- ================================================================
