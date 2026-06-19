# Frontend Architecture — Spotless Solutions

Layered, scalable structure designed for clean backend integration and RBAC.

## Folder Layout

```
src/
  components/      Presentation: reusable UI (ResponsiveModal, UserForm, ProductCard, AccessControlMatrix...)
  pages/           Route-level views (public / user / admin)
  layouts/         Shared page shells (admin sidebar layout, public layout)
  contexts/        React Context providers (AuthContext)
  store/           Centralized state stores (CartContext) — Redux-style single source of truth
  services/        Business logic + IO: api.js, storage.js, authService.js, cartService.js
  hooks/           Reusable hooks (use-mobile, use-toast)
  lib/             Pure utilities & shared constants (screens, userTypes, utils)
  assets/          Images / static
docs/              Schema, API, architecture references
```

## Layer Responsibilities

### Presentation Layer (`components/`, `pages/`, `layouts/`)
- Web + mobile-responsive UI only.
- Reads state via hooks (`useAuth`, `useCart`).
- No `fetch`, no localStorage, no business rules inline.

### Business Logic Layer (`services/`)
- `authService` — login / register / logout / me
- `cartService` — pure functions: addItem, updateQuantity, removeItem, total
- `api.js` — single fetch wrapper, adds auth header, base URL via `VITE_API_BASE_URL`
- Future: `orderService`, `paymentService`, `productService`

### Storage Layer (`services/storage.js`)
- Wraps `localStorage` / `sessionStorage` with safe JSON helpers.
- Centralized keys (`STORAGE_KEYS`) — swap to cookies / IndexedDB in one place.
- Owns: `auth_token`, `ss_auth_user`, `ss_cart`.

## State Management

Lightweight Context-based store (Redux-equivalent semantics, zero extra deps):

| Slice           | Provider          | Persistence         |
|-----------------|-------------------|---------------------|
| Auth / session  | `AuthContext`     | localStorage        |
| Cart            | `CartContext`     | localStorage (auto-sync) |
| RBAC perms      | `AuthContext.user.permissions` | from auth payload |
| Filters/search  | URL query params  | shareable URLs      |

Cart survives refresh, logout/re-login, and tab close.

## Authentication & RBAC

- `AuthProvider` hydrates from `storage` on mount → persistent session.
- `ProtectedRoute` gates authenticated routes; `requireAdmin` enforces role.
- Screen-wise permissions (`AccessControlMatrix`) saved on user record; the API layer enforces them server-side (see `docs/SCHEMA.sql` `has_screen_perm`).
- Logout clears token + user from storage; cart intentionally preserved.

## Unified User Model

Staff and Users share a single backend entity differentiated by `userType.kind`:
- `lib/userTypes.js` — single source of truth for types and `kind: "customer" | "staff"`.
- `components/UserForm.jsx` — one form used by both `StaffManagement` and `UserManagement`.
- Staff screen filters to non-customer types; Users screen shows all.

## Responsiveness Standard

- All modals use `ResponsiveModal` — sticky header/footer, scrollable body, `max-h-[calc(100vh-2rem)]`, no horizontal overflow.
- Tables wrap in `overflow-x-auto` with sensible `min-w-*`.
- Admin pages use `p-4 sm:p-6 lg:p-8` and `min-w-0` to prevent layout breaks.
- Forms collapse to single column on mobile via `grid-cols-1 md:grid-cols-2`.
- Tested across desktop / laptop / tablet / mobile breakpoints.
