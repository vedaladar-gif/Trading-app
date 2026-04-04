-- When user accepts Terms & Conditions (Vestera disclaimer)
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

comment on column public.profiles.terms_accepted_at is 'Set when the user accepts in-app Terms & Conditions; null means not yet accepted.';
