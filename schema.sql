-- Run this in Supabase SQL Editor.
create table if not exists public.files (
  id text primary key check (id ~ '^[a-f0-9]{16}$'),
  storage_path text not null unique,
  original_name text not null,
  title text not null,
  description text not null default '',
  size_bytes bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  created_at timestamptz not null default now()
);
alter table public.files enable row level security;
-- No public table policies: reads/writes are performed by the server using the service-role key.
insert into storage.buckets (id, name, public, file_size_limit)
values ('shared-files', 'shared-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;
