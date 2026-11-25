-- =====================================================================
-- Wedding Gift Registry — Supabase schema (run once in SQL Editor)
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- Tables ----------------------------------------------------
create table if not exists public.registries (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  owner_id     uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  couple_names text not null check (char_length(couple_names) between 1 and 100),
  wedding_date date,
  welcome_note text not null default '' check (char_length(welcome_note) <= 500),
  upi_id       text not null check (upi_id ~ '^[a-zA-Z0-9._-]{2,255}@[a-zA-Z]{2,64}$'),
  created_at   timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  registry_id   uuid not null references public.registries(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 120),
  category      text not null check (category in ('Travel','Hobby','Home','Experience')),
  note          text not null default '' check (char_length(note) <= 400),
  icon_name     text not null default 'Gift',
  image_url     text check (image_url is null or image_url ~ '^https://'),
  target_amount numeric(12,2) not null check (target_amount > 0 and target_amount <= 10000000),
  raised_amount numeric(12,2) not null default 0 check (raised_amount >= 0),
  created_at    timestamptz not null default now()
);

create table if not exists public.contributions (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.wishlist_items(id) on delete cascade,
  registry_id  uuid not null references public.registries(id) on delete cascade,
  guest_name   text not null check (char_length(guest_name) between 1 and 80),
  is_anonymous boolean not null default false,
  amount       numeric(12,2) not null check (amount > 0 and amount <= 1000000),
  message      text not null default '' check (char_length(message) <= 400),
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists wishlist_items_registry_idx on public.wishlist_items(registry_id);
create index if not exists contributions_item_idx      on public.contributions(item_id);
create index if not exists contributions_registry_idx  on public.contributions(registry_id, created_at desc);

-- ---------- Totals: trigger keeps raised_amount in sync ----------------
-- Recomputes from the source of truth (SUM of contributions) on insert,
-- amount change, or delete/reject, so the total can never drift.
create or replace function public.recalc_item_total() returns trigger
language plpgsql security definer set search_path = public as $$
declare ids uuid[];
begin
  if tg_op = 'DELETE' then ids := array[old.item_id];
  elsif tg_op = 'UPDATE' then ids := array[old.item_id, new.item_id];
  else ids := array[new.item_id];
  end if;
  update public.wishlist_items i
     set raised_amount = coalesce((select sum(c.amount) from public.contributions c where c.item_id = i.id), 0)
   where i.id = any(ids);
  return null;
end $$;

drop trigger if exists contributions_recalc on public.contributions;
create trigger contributions_recalc
  after insert or update of amount, item_id or delete on public.contributions
  for each row execute function public.recalc_item_total();

-- Block clients from writing raised_amount directly (only the trigger above may).
create or replace function public.guard_raised_amount() returns trigger
language plpgsql as $$
begin
  if pg_trigger_depth() = 1 then
    if tg_op = 'INSERT' then new.raised_amount := 0;
    else new.raised_amount := old.raised_amount;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists wishlist_items_guard on public.wishlist_items;
create trigger wishlist_items_guard
  before insert or update on public.wishlist_items
  for each row execute function public.guard_raised_amount();

-- ---------- Row-Level Security -----------------------------------------
alter table public.registries     enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.contributions  enable row level security;

-- Public reads (guests need no account)
create policy "registries are public"     on public.registries     for select to anon, authenticated using (true);
create policy "wishlist items are public" on public.wishlist_items for select to anon, authenticated using (true);
create policy "contributions are public"  on public.contributions  for select to anon, authenticated using (true);

-- Public contributions: positive amount, never pre-verified, item must belong to the registry
create policy "anyone can contribute" on public.contributions for insert to anon, authenticated
  with check (
    amount > 0 and is_verified = false
    and exists (select 1 from public.wishlist_items i
                where i.id = contributions.item_id and i.registry_id = contributions.registry_id)
  );

-- Owners manage their registry
create policy "owner inserts registry" on public.registries for insert to authenticated with check (auth.uid() = owner_id);
create policy "owner updates registry" on public.registries for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner deletes registry" on public.registries for delete to authenticated using (auth.uid() = owner_id);

-- Owners manage wishlist items
create policy "owner inserts items" on public.wishlist_items for insert to authenticated
  with check (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()));
create policy "owner updates items" on public.wishlist_items for update to authenticated
  using (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()));
create policy "owner deletes items" on public.wishlist_items for delete to authenticated
  using (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()));

-- Owners verify / remove contributions (and may change nothing else)
create policy "owner verifies contributions" on public.contributions for update to authenticated
  using (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()));
create policy "owner removes contributions" on public.contributions for delete to authenticated
  using (exists (select 1 from public.registries r where r.id = registry_id and r.owner_id = auth.uid()));

revoke update on public.contributions from authenticated, anon;
grant  update (is_verified) on public.contributions to authenticated;
