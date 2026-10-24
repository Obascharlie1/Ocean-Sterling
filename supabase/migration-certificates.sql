-- Admin-managed certificates shown on the landing page. Run once in the SQL Editor.
create table if not exists public.certificates (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  issuer     text default '',
  image_url  text not null,
  sort       integer default 0,
  created_at timestamptz default now()
);
alter table public.certificates enable row level security; -- served via service role

-- Public bucket so the landing can display the images directly.
insert into storage.buckets (id, name, public) values ('certificates', 'certificates', true)
on conflict (id) do nothing;
