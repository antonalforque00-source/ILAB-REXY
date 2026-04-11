-- ================================================================
-- LOANSPHERE — Database Setup (sql/setup.sql)
-- ================================================================
-- HOW TO USE:
-- 1. Supabase → SQL Editor → New Query
-- 2. Paste this ENTIRE file
-- 3. Click RUN → You see "Success. No rows returned"
-- ================================================================

drop table if exists blocked_emails  cascade;
drop table if exists money_back      cascade;
drop table if exists savings_txns    cascade;
drop table if exists billing         cascade;
drop table if exists loans           cascade;
drop table if exists earnings        cascade;
drop table if exists profiles        cascade;
drop table if exists users           cascade;
drop function if exists handle_new_user() cascade;

-- TABLE 1: profiles
create table profiles (
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
create table loans (
  id                uuid        default gen_random_uuid() primary key,
  user_id           uuid        references profiles(id) on delete cascade,
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
create table billing (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references profiles(id) on delete cascade,
  loan_id      uuid        references loans(id) on delete cascade,
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
create table savings_txns (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references profiles(id) on delete cascade,
  txn_id     text        unique,
  category   text,
  amount     numeric     not null,
  note       text,
  status     text        default 'Completed',
  created_at timestamptz default now()
);

-- TABLE 5: money_back
create table money_back (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references profiles(id) on delete cascade,
  amount     numeric     not null,
  note       text,
  created_at timestamptz default now()
);

-- TABLE 6: earnings (standalone)
create table earnings (
  id          uuid        default gen_random_uuid() primary key,
  description text        not null,
  amount      numeric     not null,
  created_at  timestamptz default now()
);

-- TABLE 7: blocked_emails (standalone)
create table blocked_emails (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  reason     text,
  created_at timestamptz default now()
);

-- Disable Row Level Security
alter table profiles       disable row level security;
alter table loans          disable row level security;
alter table billing        disable row level security;
alter table savings_txns   disable row level security;
alter table money_back     disable row level security;
alter table earnings       disable row level security;
alter table blocked_emails disable row level security;

-- Grant access
grant all on profiles       to anon, authenticated;
grant all on loans          to anon, authenticated;
grant all on billing        to anon, authenticated;
grant all on savings_txns   to anon, authenticated;
grant all on money_back     to anon, authenticated;
grant all on earnings       to anon, authenticated;
grant all on blocked_emails to anon, authenticated;

-- ================================================================
-- Done! 7 tables created. Admin: admin / Admin@LoanSphere2024!
-- ================================================================
