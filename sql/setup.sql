


drop table if exists blocked_emails  cascade;
drop table if exists money_back      cascade;
drop table if exists savings_txns    cascade;
drop table if exists billing         cascade;
drop table if exists loans           cascade;
drop table if exists earnings        cascade;
drop table if exists profiles        cascade;
drop table if exists users           cascade;
drop function if exists handle_new_user() cascade;

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


create table public.money_back (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references public.profiles(id) on delete cascade,
  amount     numeric     not null,
  note       text,
  created_at timestamptz default now()
);


create table public.earnings (
  id          uuid        default gen_random_uuid() primary key,
  description text        not null,
  amount      numeric     not null,
  created_at  timestamptz default now()
);


create table public.blocked_emails (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  reason     text,
  created_at timestamptz default now()
);


alter table public.profiles       disable row level security;
alter table public.loans          disable row level security;
alter table public.billing        disable row level security;
alter table public.savings_txns   disable row level security;
alter table public.money_back     disable row level security;
alter table public.earnings       disable row level security;
alter table public.blocked_emails disable row level security;


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

-- Admin Login: admin / Admin@LoanSphere2024!
