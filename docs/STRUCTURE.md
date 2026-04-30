# Spotless Solutions — Project & Code Structure

This document describes the structure of the **Spotless Solutions** e-commerce
frontend (React.js, JavaScript only, Tailwind CSS, react-router-dom v6).

---

## 1. Top-level layout

```
spotless-solutions/
├── public/                     # Static assets served as-is (favicon, robots.txt)
├── docs/                       # Project documentation (this folder)
│   ├── STRUCTURE.md
│   ├── API.md
│   └── ASSETS.md
├── src/
│   ├── assets/                 # Imported images used by components
│   ├── components/             # Reusable UI building blocks
│   │   ├── ui/                 # shadcn/ui primitives (button, dialog, etc.)
│   │   ├── AdminSidebar.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCircle.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── AccessControlMatrix.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   └── ToggleSwitch.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx     # Global auth + role state
│   ├── hooks/                  # Reusable React hooks
│   ├── lib/
│   │   ├── screens.js          # Screen registry for RBAC
│   │   └── utils.ts            # cn() + small helpers
│   ├── pages/
│   │   ├── public/             # Anonymous + customer-facing pages
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── PaymentSuccess.jsx
│   │   ├── user/               # Authenticated customer area
│   │   │   ├── Profile.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   └── Wishlist.jsx
│   │   └── admin/              # Admin / staff area (RBAC-gated)
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProfile.jsx
│   │       ├── OrderManagement.jsx
│   │       ├── ProductManagement.jsx
│   │       ├── CategoryManagement.jsx
│   │       ├── TagsManagement.jsx
│   │       ├── UserManagement.jsx
│   │       ├── UserTypeManagement.jsx
│   │       └── StaffManagement.jsx
│   ├── App.tsx                 # Route table + providers
│   ├── main.tsx                # ReactDOM bootstrap
│   └── index.css               # Tailwind layers + design tokens
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

> Backend is **not** part of this repo. All data calls are placeholder
> comments of the form `// TODO: API INTEGRATION -> METHOD /api/... { payload }`.

---

## 2. Component / module structure

Components are split by responsibility, not by feature:

| Folder | Purpose |
|---|---|
| `components/ui/` | Headless / shadcn primitives, never coupled to a feature |
| `components/` (root) | Project-specific reusable widgets (e.g. `ProductCard`) |
| `pages/<area>/` | Route-level screens; orchestrate components, no styling primitives |
| `contexts/` | Cross-cutting state (auth, role, permissions) |
| `lib/` | Pure helpers and constants (no JSX) |

**Rules**
- A component file exports a **single default** React component.
- Page files contain *no business logic* — they call hooks / context and
  render presentational components.
- Reusable widgets live in `components/`, not inside a `pages/` folder.

---

## 3. Page-level organisation

Every page follows the same shape:

```
1. Imports (React → router → contexts → components → icons → assets)
2. Local constants (mock data, option lists with TODO API comments)
3. Component definition
   a. Local state (useState)
   b. Derived data (filter / map)
   c. Handlers (open / save / delete)
   d. JSX return (header → toolbar → main content → modals)
4. export default
```

---

## 4. State management approach

- **Global state** (auth user, role, permissions) lives in
  `contexts/AuthContext.jsx`.
- **Server state** is fetched per page with `useState` + a `useEffect` that
  contains the `// TODO: API INTEGRATION ->` comment. When a real backend
  is wired in, replace these with a data layer (React Query recommended).
- **Local UI state** (modal open, search input, form draft) stays inside
  the page component.
- **Cart / wishlist** currently use local component state with `localStorage`
  hydration; promote to a context once a session backend exists.

---

## 5. API handling structure

All network calls use the standardised placeholder format:

```js
// TODO: API INTEGRATION -> POST /api/admin/products { ...form } => { product }
```

Conventions:

- HTTP verb is always uppercase (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- Resource paths are kebab-case under `/api/<area>/<resource>`.
- The arrow `=>` separates **request payload** from **response shape**.
- Auth-protected endpoints sit under `/api/user/...` or `/api/admin/...`.

When wiring a real backend:

1. Create `src/api/` with one file per resource (`products.js`,
   `orders.js`, ...).
2. Each function returns a Promise and throws on non-2xx.
3. Keep the same payload / response shape documented in `docs/API.md`.

---

## 6. Reusable components

| Component | Used by |
|---|---|
| `ProductCard` | Home, Shop, Wishlist |
| `CategoryCircle` | Home |
| `Header` / `Footer` | Public + user pages |
| `AdminSidebar` | All admin pages |
| `ProtectedRoute` | `App.tsx` route table |
| `AccessControlMatrix` | Staff / User Type management |
| `ConfirmDialog` | All admin delete flows |
| `EmptyState` | Empty tables and lists |
| `ToggleSwitch` | Product active toggle, settings |

Forms are not abstracted into a generic `<Form>` component — they are simple
enough to repeat with consistent Tailwind classes:

- Inputs: `h-11 px-4 rounded-lg border border-border bg-background`
- Labels: `block text-sm font-medium text-foreground mb-1`
- Grid: `grid grid-cols-1 md:grid-cols-2 gap-4`

Tables share these classes:

- Wrapper: `bg-card rounded-lg shadow-card overflow-hidden`
- Scroll: `overflow-x-auto` on the inner div
- Head: `bg-muted` with `text-left px-4 py-3 text-sm font-medium`

---

## 7. Naming conventions

| Item | Convention | Example |
|---|---|---|
| Component file | PascalCase `.jsx` | `ProductCard.jsx` |
| Page file | PascalCase `.jsx` | `OrderHistory.jsx` |
| Hook | `useXyz.js` | `useCart.js` |
| Helper / constant | camelCase `.js` | `screens.js` |
| Route path | kebab-case | `/admin/user-types` |
| API endpoint | kebab-case | `/api/admin/order-status` |
| CSS token | kebab-case HSL var | `--primary-foreground` |
| Boolean prop | `is...` / `has...` / `can...` | `isEditing`, `canCancel` |
| Event handler | `handle...` / `on...` | `handleSave`, `onCancel` |

---

## 8. RBAC structure

RBAC is enforced in three layers:

1. **Route layer** — `ProtectedRoute` checks `useAuth()` for an authenticated
   user and an optional `requireAdmin` flag.

   ```jsx
   <Route
     path="/admin/orders"
     element={<ProtectedRoute requireAdmin><OrderManagement /></ProtectedRoute>}
   />
   ```

2. **Permission layer** — `src/lib/screens.js` exports the canonical list
   of screens (`APP_SCREENS`) and the `{ read, write, delete }` shape used
   on every staff / user record:

   ```js
   {
     dashboard:  { read: true,  write: false, delete: false },
     products:   { read: true,  write: true,  delete: false },
     ...
   }
   ```

3. **UI layer** — Pages should hide / disable Edit and Delete buttons when
   the current user lacks `write` / `delete` for that screen. The
   `AccessControlMatrix` component is reused on Staff and User Type screens
   to author these payloads.

> **Security note:** the frontend matrix is a UX hint only. The backend
> **must** re-validate every mutation against the user's stored
> permissions.

---

## 9. Where each feature lives

| Feature | Customer surface | Admin surface |
|---|---|---|
| Catalog | `pages/public/Shop.jsx`, `Home.jsx` | `pages/admin/ProductManagement.jsx` |
| Categories | `pages/public/Home.jsx` (circles) | `pages/admin/CategoryManagement.jsx` |
| Tags | `components/ProductCard.jsx` | `pages/admin/TagsManagement.jsx` |
| Cart | `pages/public/Cart.jsx` | — |
| Checkout | `pages/public/Checkout.jsx`, `PaymentSuccess.jsx` | — |
| Orders | `pages/user/OrderHistory.jsx`, `OrderTracking.jsx` | `pages/admin/OrderManagement.jsx` |
| Profile | `pages/user/Profile.jsx` | `pages/admin/AdminProfile.jsx` |
| Users | — | `pages/admin/UserManagement.jsx`, `UserTypeManagement.jsx` |
| Staff & RBAC | — | `pages/admin/StaffManagement.jsx` + `AccessControlMatrix` |

---

## 10. Adding a new feature — checklist

1. Decide the area: `public/`, `user/`, or `admin/`.
2. Add the route in `src/App.tsx` and wrap in `ProtectedRoute` if needed.
3. Add a sidebar / header entry if applicable.
4. Use the existing form / table class conventions (Section 6).
5. Insert `// TODO: API INTEGRATION -> ...` comments wherever data is
   read or written.
6. Document the new payload / response in `docs/API.md`.
