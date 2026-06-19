# Spotless Solutions — Backend API & RBAC Contract

Companion to **`docs/SCHEMA.sql`**. Defines authentication, role-based access
control, and CRUD endpoints for the **core scope**: categories, tags, products
(incl. bundles), users, user types, roles, and screen permissions.

> Transport: REST over HTTPS, JSON bodies. When deployed on Lovable Cloud,
> most endpoints are served directly by PostgREST against the tables defined
> in `SCHEMA.sql`; only the routes marked **(edge function)** require custom
> server logic.

---

## 1. Authentication

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/signup`         | public | Email + password. Trigger auto-creates `profiles` row + `customer` role. |
| POST | `/auth/login`          | public | Returns `{ access_token, refresh_token, user }`. |
| POST | `/auth/logout`         | bearer | Invalidates the session. |
| POST | `/auth/password/reset` | public | Sends reset email. |
| POST | `/auth/password/update`| bearer | Body `{ password }`. |
| GET  | `/auth/me`             | bearer | Returns `{ user, profile, roles[], permissions{} }`. |

**`/auth/me` response**

```json
{
  "user":    { "id": "uuid", "email": "ravi@example.com" },
  "profile": { "name": "Ravi Kumar", "phone": "+91...", "profile_picture": "..." },
  "roles":   ["staff"],
  "permissions": {
    "dashboard":  { "read": true,  "write": false, "delete": false },
    "products":   { "read": true,  "write": true,  "delete": false },
    "categories": { "read": true,  "write": false, "delete": false }
  }
}
```

The frontend stores this object in `AuthContext` and uses it to:
* gate routes (`ProtectedRoute requireAdmin` → checks `roles.includes('admin')`)
* hide/show buttons (`permissions.products.write` etc.)

---

## 2. Authorization model

Two layers, both enforced server-side via RLS in `SCHEMA.sql`:

1. **Role** (`user_roles.role`) — `admin | staff | customer`.
   * `admin` bypasses all `has_screen_perm` checks (`has_screen_perm` returns
     `true` for admins).
   * `customer` is the default role assigned on signup.
2. **Screen permission** (`user_screen_permissions`) — per-user matrix of
   `(screen, can_read, can_write, can_delete)` for `staff` users. Mirrors
   `AccessControlMatrix.jsx` and `src/lib/screens.js`.

**Rule of thumb for the frontend**

```js
// From useAuth():
const canEdit   = isAdmin || permissions?.products?.write;
const canDelete = isAdmin || permissions?.products?.delete;
```

**Rule of thumb for APIs**: never trust the client. Every mutation is
re-checked by the RLS policies declared in `SCHEMA.sql`.

---

## 3. Categories — `/api/categories`

| Method | Path | Required permission |
|---|---|---|
| GET    | `/api/categories`            | public read (active only) / admin sees all |
| GET    | `/api/categories/:id`        | public |
| POST   | `/api/categories`            | `categories.write` |
| PUT    | `/api/categories/:id`        | `categories.write` |
| DELETE | `/api/categories/:id`        | `categories.delete` |

**Create / Update body**

```json
{ "name": "Kitchen Care", "slug": "kitchen-care", "icon": "https://...", "active": true }
```

**List response**

```json
{ "data": [
  { "id": "uuid", "name": "Cleaning Liquids", "slug": "cleaning-liquids",
    "icon": "...", "active": true, "products_count": 24 }
]}
```

---

## 4. Tags — `/api/tags`

| Method | Path | Required permission |
|---|---|---|
| GET    | `/api/tags`         | public |
| POST   | `/api/tags`         | `tags.write` |
| PUT    | `/api/tags/:id`     | `tags.write` |
| DELETE | `/api/tags/:id`     | `tags.delete` |

**Body**

```json
{ "name": "Eco-Friendly", "icon": "🌿", "color": "#2EA46B" }
```

---

## 5. Products — `/api/products`

| Method | Path | Required permission |
|---|---|---|
| GET    | `/api/products?page=&search=&category=` | public |
| GET    | `/api/products/:id`                     | public |
| POST   | `/api/products`                         | `products.write` |
| PUT    | `/api/products/:id`                     | `products.write` |
| PATCH  | `/api/products/:id/status`              | `products.write` |
| DELETE | `/api/products/:id`                     | `products.delete` |

**Create body** (matches the admin form fields)

```json
{
  "name": "Premium Multi-Surface Cleaner 500ml",
  "slug": "premium-multi-surface-cleaner-500ml",
  "description": "...",
  "highlights": ["Streak-free", "Safe on glass"],
  "category_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "size": "M",
  "volume": "500ml",
  "sku": "SS-CL-500",
  "barcode": "8901234567890",
  "manufacturer": "Spotless Pvt Ltd",
  "hsn": "3402",
  "gst_percent": 18,
  "product_type": "simple",
  "bundle_items": [],
  "actual_price": 299,
  "selling_price": 249,
  "discount_percent": 17,
  "quantity_available": 150,
  "image": "https://...",
  "video_demo": "https://...",
  "enable_rating": true,
  "show_rating": true,
  "active": true
}
```

**Bundle product**

```json
{
  "product_type": "bundle",
  "bundle_items": [
    { "child_product_id": "uuid_a", "quantity": 2 },
    { "child_product_id": "uuid_b", "quantity": 1 }
  ]
}
```

> Implementation note (edge function): Creating/updating a product writes
> to three tables in a single transaction — `products`, `product_tags`,
> `product_bundle_items`.

---

## 6. Users (admin) — `/api/admin/users`

| Method | Path | Required permission |
|---|---|---|
| GET    | `/api/admin/users?role=&status=&search=` | `users.read` |
| GET    | `/api/admin/users/:id`                   | `users.read` |
| POST   | `/api/admin/users`                       | `users.write` (edge function — creates auth user) |
| PUT    | `/api/admin/users/:id`                   | `users.write` |
| DELETE | `/api/admin/users/:id`                   | `users.delete` (admin only) |

**Create body**

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "+91 9123456780",
  "password": "<initial>",
  "role": "staff",
  "user_type_id": "uuid",
  "branch": "Bengaluru",
  "responsibilities": "Inventory + dispatch",
  "profile_picture": "https://...",
  "status": "active",
  "permissions": {
    "dashboard":  { "read": true,  "write": false, "delete": false },
    "products":   { "read": true,  "write": true,  "delete": false },
    "categories": { "read": true,  "write": false, "delete": false },
    "tags":       { "read": true,  "write": false, "delete": false },
    "users":      { "read": false, "write": false, "delete": false },
    "user_types": { "read": false, "write": false, "delete": false },
    "staff":      { "read": false, "write": false, "delete": false },
    "orders":     { "read": true,  "write": true,  "delete": false },
    "reports":    { "read": true,  "write": false, "delete": false },
    "settings":   { "read": false, "write": false, "delete": false }
  }
}
```

The edge function performs, in order:
1. `auth.admin.createUser({ email, password, email_confirm: true })`
2. `update profiles set name/phone/branch/... where id = new_user.id`
3. `insert into user_roles (user_id, role)`
4. Upsert all 10 rows into `user_screen_permissions`

---

## 7. User Types — `/api/admin/user-types`

| Method | Path | Required permission |
|---|---|---|
| GET    | `/api/admin/user-types`     | `user_types.read` |
| POST   | `/api/admin/user-types`     | `user_types.write` |
| PUT    | `/api/admin/user-types/:id` | `user_types.write` |
| DELETE | `/api/admin/user-types/:id` | `user_types.delete` |

```json
{ "name": "Store Manager", "description": "Manages a branch's inventory and staff." }
```

---

## 8. Roles & Permissions — `/api/admin/users/:id/...`

| Method | Path | Required permission |
|---|---|---|
| GET | `/api/admin/users/:id/roles`       | `users.read` |
| PUT | `/api/admin/users/:id/roles`       | admin only |
| GET | `/api/admin/users/:id/permissions` | `users.read` |
| PUT | `/api/admin/users/:id/permissions` | admin only |

**Roles body**

```json
{ "roles": ["staff"] }
```

**Permissions body** — same shape as the `permissions` block in §6.

---

## 9. Error envelope (all endpoints)

```json
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Missing products.write" } }
```

Common codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403),
`VALIDATION_ERROR` (400, includes `field`), `NOT_FOUND` (404),
`CONFLICT` (409, e.g. duplicate slug), `RATE_LIMITED` (429),
`INTERNAL` (500).

---

## 10. Frontend integration map

| UI surface | Hook / call |
|---|---|
| `Login.jsx`              | `supabase.auth.signInWithPassword` → load `/auth/me` → redirect by role |
| `AuthContext.jsx`        | Holds `{ user, profile, roles, permissions }`; exposes `hasPerm(screen, perm)` |
| `ProtectedRoute`         | `requireAdmin` → `roles.includes('admin')`; otherwise `permissions[screen].read` |
| `AccessControlMatrix`    | Reads/writes `user_screen_permissions` rows verbatim |
| `ProductManagement.jsx`  | `GET /api/products` for list; gates Edit/Delete by `permissions.products.{write,delete}` |
| `CategoryManagement.jsx` | Same pattern, scoped to `categories` |
| `TagsManagement.jsx`     | Same pattern, scoped to `tags` |
| `UserManagement.jsx`     | Calls the admin user edge function in §6 |
| `StaffManagement.jsx`    | Subset of users where `role = 'staff'` |
| `UserTypeManagement.jsx` | CRUD on `user_types` |

---

## 11. Next step

Approve this contract, then I'll:

1. Enable **Lovable Cloud**.
2. Apply `docs/SCHEMA.sql` as a migration.
3. Replace the `// TODO: API INTEGRATION` placeholders in the admin JSX
   screens with real Supabase client calls.
4. Wire `AuthContext` to real auth (signup/login/logout + role + permission
   loading on session change).
