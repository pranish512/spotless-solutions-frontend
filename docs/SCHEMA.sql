-- =====================================================================
-- Spotless Solutions — Core Database Schema
-- Target: PostgreSQL (Lovable Cloud / Supabase)
-- Scope:  Auth, Roles, Screen-level RBAC, Categories, Tags, Products, Users
--
-- Conventions:
--   * UUID primary keys (gen_random_uuid())
--   * created_at / updated_at on every business table
--   * RLS ENABLED on every table; policies use has_role() / has_screen_perm()
--     SECURITY DEFINER helpers to avoid recursive RLS lookups.
--   * Roles live in `user_roles` (NEVER on the profiles table) to prevent
--     privilege-escalation attacks.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type public.app_role as enum ('admin', 'staff', 'customer');

create type public.user_status as enum ('active', 'inactive');

create type public.product_type as enum ('simple', 'bundle');

-- Screens map to AccessControlMatrix keys in src/lib/screens.js
create type public.app_screen as enum (
  'dashboard',
  'products',
  'categories',
  'tags',
  'users',
  'user_types',
  'staff',
  'orders',
  'reports',
  'settings'
);


-- ---------------------------------------------------------------------
-- 2. PROFILES  (1-to-1 with auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  email           text not null unique,
  phone           text,
  profile_picture text,
  branch          text,
  responsibilities text,
  status          public.user_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;


-- ---------------------------------------------------------------------
-- 3. USER ROLES  (separate table — required for safe RBAC)
-- ---------------------------------------------------------------------
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;


-- ---------------------------------------------------------------------
-- 4. USER TYPES  (admin-defined labels, e.g. "Store Manager")
-- ---------------------------------------------------------------------
create table public.user_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_types enable row level security;

-- Optional link from profile → user_type
alter table public.profiles
  add column user_type_id uuid references public.user_types(id) on delete set null;


-- ---------------------------------------------------------------------
-- 5. SCREEN PERMISSIONS  (per-user, per-screen read/write/delete)
--    Mirrors AccessControlMatrix in the admin UI.
-- ---------------------------------------------------------------------
create table public.user_screen_permissions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  screen     public.app_screen not null,
  can_read   boolean not null default false,
  can_write  boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, screen)
);

alter table public.user_screen_permissions enable row level security;


-- ---------------------------------------------------------------------
-- 6. CATEGORIES
-- ---------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  icon       text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;


-- ---------------------------------------------------------------------
-- 7. TAGS
-- ---------------------------------------------------------------------
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  icon       text,
  color      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tags enable row level security;


-- ---------------------------------------------------------------------
-- 8. PRODUCTS  (+ bundle items + tag join)
-- ---------------------------------------------------------------------
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  description         text,
  highlights          text[] default '{}',
  category_id         uuid references public.categories(id) on delete set null,
  size                text,
  volume              text,
  sku                 text unique,
  barcode             text,
  manufacturer        text,
  hsn                 text,
  gst_percent         integer not null default 18 check (gst_percent between 0 and 28),
  product_type        public.product_type not null default 'simple',
  actual_price        integer not null check (actual_price >= 0),
  selling_price       integer not null check (selling_price >= 0),
  discount_percent    integer not null default 0 check (discount_percent between 0 and 100),
  quantity_available  integer not null default 0 check (quantity_available >= 0),
  image               text,
  video_demo          text,
  enable_rating       boolean not null default true,
  show_rating         boolean not null default true,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.products enable row level security;

create index idx_products_category on public.products(category_id);
create index idx_products_active   on public.products(active);

-- Tag join
create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id     uuid not null references public.tags(id)     on delete cascade,
  primary key (product_id, tag_id)
);

alter table public.product_tags enable row level security;

-- Bundle composition (only used when products.product_type = 'bundle')
create table public.product_bundle_items (
  id              uuid primary key default gen_random_uuid(),
  bundle_id       uuid not null references public.products(id) on delete cascade,
  child_product_id uuid not null references public.products(id) on delete restrict,
  quantity        integer not null default 1 check (quantity > 0),
  unique (bundle_id, child_product_id)
);

alter table public.product_bundle_items enable row level security;


-- =====================================================================
-- 9. RBAC HELPER FUNCTIONS  (SECURITY DEFINER — break RLS recursion)
-- =====================================================================

-- Returns true if the given user has the given role.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Returns true if the user has a specific permission on a screen.
-- _perm is one of 'read' | 'write' | 'delete'. Admins always pass.
create or replace function public.has_screen_perm(
  _user_id uuid,
  _screen  public.app_screen,
  _perm    text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_admin boolean;
  v_row   public.user_screen_permissions%rowtype;
begin
  select public.has_role(_user_id, 'admin') into v_admin;
  if v_admin then
    return true;
  end if;

  select * into v_row
  from public.user_screen_permissions
  where user_id = _user_id and screen = _screen;

  if not found then
    return false;
  end if;

  return case _perm
    when 'read'   then v_row.can_read
    when 'write'  then v_row.can_write
    when 'delete' then v_row.can_delete
    else false
  end;
end;
$$;


-- =====================================================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP + DEFAULT CUSTOMER ROLE
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- =====================================================================
-- 11. updated_at TRIGGERS
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_types','user_screen_permissions',
    'categories','tags','products'
  ] loop
    execute format(
      'create trigger trg_%s_touch before update on public.%s
       for each row execute function public.touch_updated_at();', t, t);
  end loop;
end $$;


-- =====================================================================
-- 12. RLS POLICIES
-- =====================================================================

-- ---- profiles -------------------------------------------------------
create policy "profiles_self_select"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "profiles_self_update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "profiles_admin_insert"
  on public.profiles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "profiles_admin_delete"
  on public.profiles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));


-- ---- user_roles -----------------------------------------------------
create policy "user_roles_self_read"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "user_roles_admin_write"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- ---- user_types -----------------------------------------------------
create policy "user_types_read_all_auth"
  on public.user_types for select
  to authenticated using (true);

create policy "user_types_admin_write"
  on public.user_types for all
  to authenticated
  using (public.has_screen_perm(auth.uid(), 'user_types', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'user_types', 'write'));


-- ---- user_screen_permissions ---------------------------------------
create policy "perm_self_read"
  on public.user_screen_permissions for select
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "perm_admin_write"
  on public.user_screen_permissions for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- ---- categories (public read, RBAC write) --------------------------
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated using (active or public.has_role(auth.uid(), 'admin'));

create policy "categories_write"
  on public.categories for insert to authenticated
  with check (public.has_screen_perm(auth.uid(), 'categories', 'write'));

create policy "categories_update"
  on public.categories for update to authenticated
  using  (public.has_screen_perm(auth.uid(), 'categories', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'categories', 'write'));

create policy "categories_delete"
  on public.categories for delete to authenticated
  using (public.has_screen_perm(auth.uid(), 'categories', 'delete'));


-- ---- tags -----------------------------------------------------------
create policy "tags_public_read"
  on public.tags for select to anon, authenticated using (true);

create policy "tags_write"
  on public.tags for insert to authenticated
  with check (public.has_screen_perm(auth.uid(), 'tags', 'write'));

create policy "tags_update"
  on public.tags for update to authenticated
  using (public.has_screen_perm(auth.uid(), 'tags', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'tags', 'write'));

create policy "tags_delete"
  on public.tags for delete to authenticated
  using (public.has_screen_perm(auth.uid(), 'tags', 'delete'));


-- ---- products -------------------------------------------------------
create policy "products_public_read"
  on public.products for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));

create policy "products_write"
  on public.products for insert to authenticated
  with check (public.has_screen_perm(auth.uid(), 'products', 'write'));

create policy "products_update"
  on public.products for update to authenticated
  using  (public.has_screen_perm(auth.uid(), 'products', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'products', 'write'));

create policy "products_delete"
  on public.products for delete to authenticated
  using (public.has_screen_perm(auth.uid(), 'products', 'delete'));


-- ---- product_tags & bundle_items: inherit product permissions ------
create policy "product_tags_read"
  on public.product_tags for select to anon, authenticated using (true);

create policy "product_tags_write"
  on public.product_tags for all to authenticated
  using  (public.has_screen_perm(auth.uid(), 'products', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'products', 'write'));

create policy "bundle_items_read"
  on public.product_bundle_items for select to anon, authenticated using (true);

create policy "bundle_items_write"
  on public.product_bundle_items for all to authenticated
  using  (public.has_screen_perm(auth.uid(), 'products', 'write'))
  with check (public.has_screen_perm(auth.uid(), 'products', 'write'));


-- =====================================================================
-- 13. SEED (optional) — promote first admin manually:
--   insert into public.user_roles (user_id, role) values ('<uuid>', 'admin');
-- =====================================================================
