# SoftShape AI — SuperAdmin Dashboard

Standalone admin dashboard for managing the SoftShape AI SaaS platform. Built with React, Vite, and TailwindCSS. Completely separate from the main SoftShape AI frontend — own repo, own hosting, own deployment.

## Features

- **Overview** — Platform-wide stats (total outlets, active, trialing, suspended, expired, users) + monthly revenue chart
- **Restaurants** — Search, list, view details, suspend/activate, extend trial, change plan
- **Payments** — Paginated payment history with gateway, status, and amount
- **Plans** — CRUD for subscription plan configurations (pricing, outlets, custom quotes)
- **Feature Flags** — CRUD for feature flags with global enable and per-restaurant targeting
- **Announcements** — CRUD for platform announcements (info/warning/critical) with scheduling
- **Audit Logs** — Filterable, paginated audit trail of all superadmin actions
- **System Health** — Database & Redis status, table counts

## Tech Stack

- React 18
- Vite 6
- TailwindCSS 4
- Lucide Icons

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Create a `.env` file in the project root:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

In development (without `VITE_API_URL`), the Vite proxy forwards `/api/*` requests to `http://localhost:3000`.

## Authentication

The dashboard uses a shared secret (`x-superadmin-secret` header) instead of JWT. Enter the secret on the login screen — it's stored in `localStorage` and sent with every API request.

The backend must have `SUPERADMIN_SECRET` env var set to the same value.

## API Endpoints

All requests go to the SoftShape backend under `/api/superadmin/*`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/stats` | Platform statistics |
| GET | `/api/superadmin/restaurants` | List all restaurants |
| GET | `/api/superadmin/restaurants/:id` | Restaurant details |
| PATCH | `/api/superadmin/restaurants/:id/suspend` | Suspend restaurant |
| PATCH | `/api/superadmin/restaurants/:id/activate` | Activate restaurant |
| PATCH | `/api/superadmin/restaurants/:id/extend-trial` | Extend trial period |
| PATCH | `/api/superadmin/restaurants/:id/change-plan` | Change restaurant plan |
| GET | `/api/superadmin/payments` | Paginated payments |
| GET | `/api/superadmin/revenue/monthly` | Monthly revenue data |
| GET/POST/PATCH | `/api/superadmin/plans` | Plan config CRUD |
| GET/POST/PATCH | `/api/superadmin/feature-flags` | Feature flag CRUD |
| GET/POST/PATCH | `/api/superadmin/announcements` | Announcement CRUD |
| GET | `/api/superadmin/audit-logs` | Audit log query |
| GET | `/api/superadmin/health` | System health check |

## Deployment

This is a static SPA — deploy the `dist/` folder to any static host:

- **Netlify**: Build command `npm run build`, publish directory `dist`
- **Vercel**: Framework preset "Vite", build command `npm run build`
- **GitHub Pages**: `npm run build` then publish `dist/`

Set `VITE_API_URL` as an environment variable pointing to your backend.