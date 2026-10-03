-- ============================================================
-- Dcribioshop - Painel administrativo (Supabase)
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Produtos (mesma base exibida no site público)
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  images text[] not null default '{}',
  category text not null,
  tab text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_tab_idx on public.products (tab);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_published_idx on public.products (published);

-- ------------------------------------------------------------
-- Eventos / métricas
-- event_type: page_view | whatsapp_click | cart_add | cart_whatsapp
-- ------------------------------------------------------------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  event_type text not null,
  path text,
  product_slug text,
  product_name text,
  quantity integer,
  device_type text,
  os text,
  browser text,
  classification text,
  is_bot boolean not null default false,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_type_idx on public.events (event_type);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.products enable row level security;
alter table public.events enable row level security;

-- Produtos: leitura pública apenas dos publicados
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (published = true);

-- Produtos: admin autenticado lê tudo
drop policy if exists products_admin_read on public.products;
create policy products_admin_read on public.products
  for select to authenticated
  using (true);

-- Produtos: admin autenticado escreve
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated
  using (true) with check (true);

-- Eventos: inserção pública (site registra métricas)
drop policy if exists events_public_insert on public.events;
create policy events_public_insert on public.events
  for insert to anon, authenticated
  with check (true);

-- Eventos: leitura apenas admin autenticado
drop policy if exists events_admin_read on public.events;
create policy events_admin_read on public.events
  for select to authenticated
  using (true);

-- Eventos: admin autenticado pode apagar métricas (botão "Limpar métricas")
drop policy if exists events_admin_delete on public.events;
create policy events_admin_delete on public.events
  for delete to authenticated
  using (true);

-- ------------------------------------------------------------
-- Storage: bucket público de imagens dos produtos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images');
