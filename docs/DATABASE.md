# Spotless Solutions — Database Architecture & Schema

> Production-ready relational design for the Spotless Solutions e-commerce platform.
> Target engine: **PostgreSQL 15+** (Lovable Cloud / Supabase compatible).
> Companion file: [`docs/SCHEMA.sql`](./SCHEMA.sql) (executable DDL for the core slice).
> This document expands the core slice into the full operational schema covering
> ecommerce, RBAC, masters, cart, checkout, addresses, ratings, and audit.

---

## 1. Architecture Overview

The schema is organized into **eight logical domains**, each owning a small set of
tightly-cohesive tables. Cross-domain references are made by foreign key only —
never by duplicated columns — to keep normalization clean and joins predictable.

```text
                ┌────────────────────────────────────────────────┐
                │                  AUTH & RBAC                   │
                │  auth.users · profiles · user_roles            │
                │  user_screen_permissions · user_sessions       │
                └───────────────┬────────────────────────────────┘
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
   ┌────▼─────┐         ┌───────▼────────┐       ┌───────▼────────┐
   │ MASTERS  │         │   CATALOG      │       │   CUSTOMER     │
   │ branches │◄────────┤ categories     │       │ addresses      │
   │ user_    │         │ tags           │       │ wishlists      │
   │  types   │         │ products       │       │ carts          │
   │          │         │ product_       │       │ cart_items     │
   │          │         │  variants      │       │                │
   │          │         │ product_tags   │       │                │
   │          │         │ product_       │       │                │
   │          │         │  bundle_items  │       │                │
   │          │         │ product_images │       │                │
   └──────────┘         └───────┬────────┘       └────────┬───────┘
                                │                         │
                        ┌───────▼─────────────────────────▼───────┐
                        │             ORDERS / PAYMENTS           │
                        │  orders · order_items · order_status_   │
                        │  history · payments · refunds           │
                        │  shipments                              │
                        └───────────────────┬─────────────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │   REVIEWS         │
                                  │ product_reviews   │
                                  │ (gated by orders) │
                                  └───────────────────┘
```

### Design principles

| Principle | How it's applied |
|---|---|
| **Normalization (3NF)** | No repeated groups; tags/variants/images live in child tables |
| **Stable PKs** | `uuid` PKs everywhere — safe to expose, no enumeration leak |
| **Money safety** | All monetary amounts stored as `integer` minor units (paise) |
| **Audit columns** | `created_at`, `updated_at` on every business table; trigger-managed |
| **Soft delete** | `active boolean` instead of physical delete on catalog/masters |
| **RBAC at DB** | RLS policies + `has_role()` / `has_screen_perm()` SECURITY DEFINER fns |
| **Read scaling** | Indexes on FKs + every column used in `WHERE` / `ORDER BY` |
| **Write scaling** | Hot tables (cart_items, order_status_history) kept narrow |

---

## 2. Domain → Table Map

| Domain | Tables |
|---|---|
| Auth & RBAC | `profiles`, `user_roles`, `user_screen_permissions`, `user_sessions` |
| Masters | `branches`, `user_types` |
| Catalog | `categories`, `tags`, `products`, `product_variants`, `product_images`, `product_tags`, `product_bundle_items` |
| Customer | `addresses`, `wishlists`, `carts`, `cart_items` |
| Orders | `orders`, `order_items`, `order_status_history`, `shipments` |
| Payments | `payments`, `refunds` |
| Reviews | `product_reviews` |
| Audit (optional) | `activity_log` |

---

## 3. Table-by-Table Structure

> Legend: **PK** primary key · **FK** foreign key · **U** unique · **IX** indexed
> Columns marked `NOT NULL` are required; everything else is nullable.

### 3.1 `profiles` — extends `auth.users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | **PK**, FK → auth.users(id) ON DELETE CASCADE | mirrors auth user |
| name | text | NOT NULL | |
| email | text | NOT NULL, **U** | |
| phone | text | IX | searchable |
| profile_picture | text | | URL |
| user_type_id | uuid | FK → user_types(id) ON DELETE SET NULL, IX | |
| branch_id | uuid | FK → branches(id) ON DELETE SET NULL, IX | staff only |
| responsibilities | text | | |
| status | user_status enum | NOT NULL, default `'active'`, IX | active/inactive |
| created_at / updated_at | timestamptz | NOT NULL, default `now()` | |

**Indexes:** `(status)`, `(user_type_id)`, `(branch_id)`, `(lower(email))`

### 3.2 `user_roles`

| Column | Type | Constraints |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | NOT NULL, FK → auth.users ON DELETE CASCADE |
| role | app_role enum (`admin` / `staff` / `customer`) | NOT NULL |
| created_at | timestamptz | NOT NULL |

**Unique:** `(user_id, role)` · **Index:** `(user_id)`

### 3.3 `user_screen_permissions`

Per-user screen ACL mirroring `AccessControlMatrix.jsx`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | FK → auth.users, NOT NULL |
| screen | app_screen enum | NOT NULL |
| can_read / can_write / can_delete | boolean | default false |
| created_at / updated_at | timestamptz | |

**Unique:** `(user_id, screen)` · **Index:** `(user_id)`

### 3.4 `user_sessions` (optional — for multi-device session control)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | FK, NOT NULL, IX |
| token_hash | text | NOT NULL, **U** |
| user_agent | text | |
| ip | inet | |
| expires_at | timestamptz | NOT NULL, IX |
| created_at | timestamptz | |

> Most apps on Lovable Cloud rely on Supabase-managed JWT sessions. Add this table
> only if you need server-side revocation or device list UI.

### 3.5 Masters — `branches`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| name | text | NOT NULL, **U** |
| description | text | |
| status | user_status enum | default `'active'`, IX |
| created_at / updated_at | timestamptz | |

### 3.6 Masters — `user_types`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| name | text | NOT NULL, **U** |
| kind | text check (kind in `'customer'`,`'staff'`) | NOT NULL |
| description | text | |
| created_at / updated_at | timestamptz | |

### 3.7 `categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| name | text | NOT NULL, **U** |
| slug | text | NOT NULL, **U**, IX |
| icon | text | |
| parent_id | uuid | FK → categories(id), nullable — supports sub-categories |
| sort_order | int | default 0 |
| active | boolean | default true, IX |
| created_at / updated_at | timestamptz | |

**Index:** `(parent_id)`, `(active, sort_order)`

### 3.8 `tags`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| name | text | NOT NULL, **U** |
| icon | text | |
| color | text | |
| created_at / updated_at | timestamptz | |

### 3.9 `products` (parent)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| name | text | NOT NULL |
| slug | text | NOT NULL, **U**, IX |
| description | text | |
| highlights | text[] | |
| category_id | uuid | FK → categories, IX |
| product_type | enum (`simple` / `bundle`) | NOT NULL |
| sku | text | **U** |
| barcode | text | IX |
| manufacturer | text | |
| hsn | text | |
| gst_percent | int | NOT NULL check 0..28 |
| actual_price | int | NOT NULL (minor units) |
| selling_price | int | NOT NULL (minor units) |
| discount_percent | int | default 0 |
| quantity_available | int | default 0 — for `simple` only |
| image | text | primary image URL (denorm of product_images) |
| video_demo | text | |
| enable_rating | boolean | default true |
| show_rating | boolean | default true |
| avg_rating | numeric(2,1) | maintained by trigger |
| rating_count | int | maintained by trigger |
| active | boolean | default true, IX |
| created_at / updated_at | timestamptz | |

**Indexes:** `(category_id)`, `(active)`, `(slug)`, GIN on `to_tsvector(name || description)` for search.

### 3.10 `product_variants` (child of products)

Used when a product ships in multiple sizes / volumes / colors.
A `simple` product with no variants behaves as a single SKU.

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| product_id | uuid | FK → products ON DELETE CASCADE, NOT NULL, IX |
| sku | text | **U** |
| size | text | |
| volume | text | |
| color | text | |
| selling_price | int | NOT NULL — overrides parent |
| quantity_available | int | default 0 |
| image | text | |
| active | boolean | default true |
| created_at / updated_at | timestamptz | |

**Unique:** `(product_id, size, volume, color)`

### 3.11 `product_images` (child)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| product_id | uuid | FK, NOT NULL, IX |
| url | text | NOT NULL |
| alt | text | |
| sort_order | int | default 0 |

### 3.12 `product_tags` (M:N join)

| Column | Type |
|---|---|
| product_id | uuid FK, **PK** part |
| tag_id | uuid FK, **PK** part |

### 3.13 `product_bundle_items` (parent product is a `bundle`)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| bundle_id | uuid | FK → products, NOT NULL |
| child_product_id | uuid | FK → products, NOT NULL |
| quantity | int | NOT NULL, > 0 |

**Unique:** `(bundle_id, child_product_id)` · **Check:** `bundle_id <> child_product_id`

### 3.14 `addresses` (per user, 1:N)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | FK, NOT NULL, IX |
| label | text | "Home" / "Office" |
| line1 / line2 | text | |
| city / state / pincode / country | text | |
| phone | text | |
| is_default | boolean | default false |
| created_at / updated_at | timestamptz | |

**Partial unique index:** `(user_id) WHERE is_default` — at most one default.

### 3.15 `wishlists`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | FK, NOT NULL |
| product_id | uuid | FK, NOT NULL |
| created_at | timestamptz | |

**Unique:** `(user_id, product_id)`

### 3.16 `carts` + `cart_items`

`carts` is one-per-user (or per-guest-session). Items live in a child table for narrow rows.

`carts`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| user_id | uuid | FK, NULLABLE (guest), **U** when not null |
| session_id | text | for guest carts, IX |
| status | enum (`active`, `ordered`, `abandoned`) | default `active` |
| updated_at | timestamptz | |

`cart_items`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| cart_id | uuid | FK ON DELETE CASCADE, NOT NULL, IX |
| product_id | uuid | FK, NOT NULL |
| variant_id | uuid | FK → product_variants, NULLABLE |
| quantity | int | NOT NULL > 0 |
| unit_price | int | snapshotted at add-time |
| created_at / updated_at | timestamptz | |

**Unique:** `(cart_id, product_id, variant_id)`

### 3.17 `orders` (parent)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| order_number | text | NOT NULL, **U**, IX — human-readable |
| user_id | uuid | FK, NOT NULL, IX |
| billing_address_id | uuid | FK → addresses |
| shipping_address_id | uuid | FK → addresses |
| status | enum (`pending`, `processing`, `dispatched`, `delivered`, `cancelled`, `refunded`) | NOT NULL, IX |
| subtotal / discount_total / tax_total / shipping_total / grand_total | int | NOT NULL |
| currency | char(3) | default `'INR'` |
| placed_at | timestamptz | NOT NULL, IX |
| dispatched_at / delivered_at / cancelled_at | timestamptz | |
| expected_delivery_at | timestamptz | shown on confirmation |
| refund_eta_days | int | nullable; set on cancel |
| notes | text | |
| created_at / updated_at | timestamptz | |

**Indexes:** `(user_id, placed_at desc)`, `(status, placed_at desc)`

### 3.18 `order_items` (child)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| order_id | uuid | FK ON DELETE CASCADE, NOT NULL, IX |
| product_id | uuid | FK |
| variant_id | uuid | FK, NULLABLE |
| product_name | text | snapshot |
| sku | text | snapshot |
| quantity | int | NOT NULL > 0 |
| unit_price / discount / tax / line_total | int | NOT NULL |

> Snapshots avoid breaking historical orders if a product is later edited or deleted.

### 3.19 `order_status_history`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| order_id | uuid | FK, NOT NULL, IX |
| from_status / to_status | enum | |
| changed_by | uuid | FK → auth.users (nullable for system) |
| note | text | |
| created_at | timestamptz | NOT NULL |

### 3.20 `shipments`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| order_id | uuid | FK, NOT NULL, IX |
| courier | text | |
| tracking_number | text | IX |
| status | text | |
| dispatched_at / delivered_at | timestamptz | |

### 3.21 `payments`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| order_id | uuid | FK, NOT NULL, IX |
| provider | text | razorpay/stripe/cod |
| provider_payment_id | text | IX |
| amount | int | NOT NULL |
| currency | char(3) | |
| status | enum (`initiated`, `succeeded`, `failed`, `refunded`) | NOT NULL, IX |
| paid_at | timestamptz | |
| raw_response | jsonb | |
| created_at | timestamptz | |

### 3.22 `refunds`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| payment_id | uuid | FK, NOT NULL |
| order_id | uuid | FK, NOT NULL |
| amount | int | NOT NULL |
| status | enum (`pending`, `processed`, `failed`) | NOT NULL |
| processed_at | timestamptz | |
| created_at | timestamptz | |

### 3.23 `product_reviews`

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| product_id | uuid | FK, NOT NULL, IX |
| user_id | uuid | FK, NOT NULL |
| order_id | uuid | FK → orders, NOT NULL — proves purchase |
| rating | int | NOT NULL check 1..5 |
| title | text | |
| body | text | |
| created_at / updated_at | timestamptz | |

**Unique:** `(user_id, product_id, order_id)` — one review per product per order.
**Trigger / app-rule:** insert allowed only when `orders.status = 'delivered'`
and `order_items` of that order contains the product.

### 3.24 `activity_log` (optional admin audit)

| Column | Type | Notes |
|---|---|---|
| id | uuid | **PK** |
| actor_id | uuid | FK → auth.users |
| entity | text | e.g. `'product'` |
| entity_id | uuid | |
| action | text | `create` / `update` / `delete` |
| diff | jsonb | |
| created_at | timestamptz | IX |

---

## 4. Relationships at a Glance

| Relationship | Type | Tables |
|---|---|---|
| User → Roles | 1:N | profiles → user_roles |
| User → Screen permissions | 1:N | profiles → user_screen_permissions |
| User → Addresses | 1:N | profiles → addresses |
| User → Cart | 1:1 | profiles → carts |
| Cart → Cart items | 1:N | carts → cart_items |
| User → Orders | 1:N | profiles → orders |
| Order → Order items | 1:N | orders → order_items |
| Order → Status history | 1:N | orders → order_status_history |
| Order → Payments | 1:N | orders → payments |
| Payment → Refunds | 1:N | payments → refunds |
| Category → Products | 1:N | categories → products |
| Category → Sub-categories | 1:N (self) | categories → categories |
| Product → Variants | 1:N | products → product_variants |
| Product → Images | 1:N | products → product_images |
| Product ↔ Tags | M:N | product_tags |
| Bundle → Child products | M:N | product_bundle_items |
| Product ← Reviews → User → Order | many-to-one (3 FKs) | product_reviews |

---

## 5. Parent-Child Mapping Summary

| Parent | Children | Cascade rule |
|---|---|---|
| `products` | `product_variants`, `product_images`, `product_tags`, `product_bundle_items` | CASCADE on parent delete |
| `categories` | `categories` (self), `products` | SET NULL on `products.category_id` |
| `carts` | `cart_items` | CASCADE |
| `orders` | `order_items`, `order_status_history`, `shipments`, `payments` | CASCADE except `payments` which RESTRICT (financial) |
| `payments` | `refunds` | RESTRICT |
| `auth.users` | `profiles`, `user_roles`, `user_screen_permissions`, `addresses`, `wishlists`, `carts`, `orders`, `product_reviews` | CASCADE on profile-side; orders/payments use RESTRICT |

---

## 6. Indexing Strategy

| Goal | Index |
|---|---|
| Product listing by category | `products(category_id, active, created_at desc)` |
| Product search | GIN on `to_tsvector('simple', name || ' ' || coalesce(description,''))` |
| Slug lookups | unique `(slug)` on `products`, `categories` |
| Customer order history | `orders(user_id, placed_at desc)` |
| Admin order queue | `orders(status, placed_at desc)` |
| Cart hydration | `cart_items(cart_id)` |
| Reviews per product | `product_reviews(product_id, created_at desc)` |
| RBAC checks | `user_roles(user_id)`, `user_screen_permissions(user_id, screen)` |
| Tracking lookup | `shipments(tracking_number)` |
| Audit | `activity_log(actor_id, created_at desc)`, `(entity, entity_id)` |

Use **partial indexes** where most rows are filtered out, e.g.
`CREATE INDEX ON orders(status) WHERE status IN ('pending','processing')`.

---

## 7. Status Fields Reference

| Table | Field | Values |
|---|---|---|
| profiles, branches, user_types | status | `active`, `inactive` |
| products, categories, variants | active | boolean |
| orders | status | `pending`, `processing`, `dispatched`, `delivered`, `cancelled`, `refunded` |
| payments | status | `initiated`, `succeeded`, `failed`, `refunded` |
| refunds | status | `pending`, `processed`, `failed` |
| carts | status | `active`, `ordered`, `abandoned` |

---

## 8. RBAC Summary (matches existing helper functions)

```sql
has_role(user_id, 'admin' | 'staff' | 'customer')
has_screen_perm(user_id, screen, 'read' | 'write' | 'delete')
```

| Resource | Read | Write | Delete |
|---|---|---|---|
| Catalog (categories, tags, products) | public | `has_screen_perm(...,'write')` | `has_screen_perm(...,'delete')` |
| Masters (branches, user_types) | authenticated | screen perm | screen perm |
| Orders | owner OR admin/staff | owner (create) / staff (update) | admin only |
| Reviews | public | owner (only if delivered order) | owner OR admin |
| RBAC tables | self OR admin | admin only | admin only |

---

## 9. Recommended API Fetch Strategy

| Concern | Strategy |
|---|---|
| **Listing pages** | Cursor pagination (`?cursor=<created_at,id>&limit=24`) — beats OFFSET on large tables |
| **Product detail** | Single endpoint joining `products` + variants + images + tags via 3 light queries (or one `select ... json_agg(...)`) |
| **Category nav** | Cache `/categories?active=true` for 5 min — low write rate |
| **Cart** | Patch endpoints (`PATCH /cart/items/:id`) to keep payloads tiny |
| **Order placement** | Single transactional RPC: insert order → items → payment intent |
| **Order list** | Index-backed `(user_id, placed_at desc)` with cursor |
| **Search** | GIN tsvector + ILIKE fallback; rank by `ts_rank` |
| **RBAC checks** | Resolve once per request, cache on the request context |
| **Reports** | Read replica or materialized views refreshed every 15 min |
| **Real-time** | Supabase Realtime channels on `orders` + `order_status_history` for tracking screen |

### Suggested API surface (REST)

```
GET    /api/products?category=&tag=&q=&min=&max=&cursor=&limit=
GET    /api/products/:slug
GET    /api/categories
POST   /api/cart/items          PATCH /api/cart/items/:id    DELETE …
POST   /api/orders              GET   /api/orders?cursor=    GET /api/orders/:id
POST   /api/orders/:id/cancel
POST   /api/products/:id/reviews   (server validates delivered order)
GET    /api/admin/users  …      (admin/staff, RBAC-gated)
```

---

## 10. Scalability & Maintainability Guidelines

1. **Money in minor units** — never `float`/`numeric` rounding bugs.
2. **Snapshot order lines** — don't join through to live products for invoices.
3. **Avoid N+1** — prefer `json_agg` or batched DataLoader-style fetchers.
4. **Soft delete catalog** — set `active=false` instead of `DELETE` to preserve order history.
5. **Triggers for derived data** — `products.avg_rating`, `products.rating_count` updated by trigger on `product_reviews`.
6. **Partition long tables** later if needed: `orders` and `activity_log` partition by month.
7. **Outbox pattern** for emails / webhooks — write to a queue table inside the same transaction.
8. **Migration discipline** — every schema change ships as a versioned migration; never mutate prod by hand.
9. **Separate read models** for heavy reports (materialized views) to keep OLTP tables lean.
10. **Backups & PITR** — enabled by default on Lovable Cloud; verify monthly.

---

## 11. Next Steps for Codex Backend Implementation

1. Apply [`docs/SCHEMA.sql`](./SCHEMA.sql) for the core slice.
2. Generate migrations for the additional tables defined here
   (`product_variants`, `product_images`, `addresses`, `carts`, `cart_items`,
   `orders`, `order_items`, `order_status_history`, `shipments`, `payments`,
   `refunds`, `wishlists`, `product_reviews`, `activity_log`).
3. Add RLS policies per the RBAC summary in §8.
4. Implement the REST surface in §9, mapping each endpoint to the indexes in §6.
5. Wire the existing frontend services (`src/services/*.js`) to call the new endpoints —
   the UI is already structured to swap mock returns with `apiRequest(...)` calls.
