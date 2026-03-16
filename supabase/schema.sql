-- Users table
create table if not exists public.users (
  id bigserial primary key,
  username text unique not null,
  password text not null,
  cash numeric not null default 10000,
  created_at timestamptz not null default now()
);

-- Portfolio (trades) table
create table if not exists public.portfolio (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  stock text not null,
  shares integer not null,
  price numeric not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- Chat messages table
create table if not exists public.chat_messages (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  role text not null,
  content text not null,
  mode text not null,
  route text,
  created_at timestamptz not null default now()
);

