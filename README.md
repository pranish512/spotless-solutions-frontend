# Spotless Solutions — Frontend

React + Vite + Tailwind storefront and admin console for Spotless Solutions.
The app talks to a FastAPI backend at `http://localhost:8000` by default.

## Local development

Prerequisites: Node.js 18+ and npm (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
# 1. Clone the repo
git clone <YOUR_GIT_URL>
cd spotless-solutions-frontend

# 2. Install dependencies
npm install

# 3. Copy the env template — required before `npm run dev`
cp .env.example .env

# 4. Start the dev server (http://localhost:8080)
npm run dev
```

### Environment variables

All client-exposed variables live in `.env` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base, e.g. `http://localhost:8000/api`. If blank, Vite proxies `/api` → `http://localhost:8000`. |
| `VITE_APP_NAME` | Display name shown in the UI. |
| `VITE_APP_ENV` | `development` / `staging` / `production`. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client (optional, leave blank until wired). |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key (optional). |
| `VITE_ASSETS_BASE_URL` | CDN/asset host override (optional). |
| `VITE_FEATURE_ADMIN_SERVICES` | Set to `true` once backend exposes `/api/admin/services`. |

`.env` is git-ignored. Never commit real secrets.

## Troubleshooting

**Blank page on http://localhost:8080 after `git pull`**
Stale Vite dependency cache after a lockfile change is the usual cause.
Clear it and restart:

```sh
rm -rf node_modules/.vite
npm run dev
```

If that doesn't help, also delete `node_modules` and reinstall:

```sh
rm -rf node_modules
npm install
npm run dev
```

**"Cannot reach backend" on login**
Make sure the FastAPI server is running on `http://localhost:8000` and that
its CORS config allows `http://localhost:8080`.

## Architecture notes

- All HTTP calls go through `src/services/*Service.js` → `apiRequest` in
  `src/services/api.js`. Do not inline `fetch` in components.
- Auth uses JWT in `localStorage` with refresh-token rotation.
- Admin screen access is gated by `ProtectedRoute` against the backend
  `AppScreenEnum`. The Services admin module currently reuses the
  `products` screen key because `services` is not yet part of
  `AppScreenEnum` server-side.
- `/api/admin/services` endpoints are not implemented yet; the Services
  admin screen is gated behind `VITE_FEATURE_ADMIN_SERVICES` and falls
  back to `localStorage` data in local dev.

## Tech stack

Vite · React 18 · TypeScript/JSX · Tailwind CSS · shadcn-ui · react-router-dom v6
