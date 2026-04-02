# Family Budget Tracker - Project Context

> **Purpose**: Complete project reference for session continuity. Read this file to get full context before starting any work.

---

## 1. Overview

A **full-stack family budget tracker** built as a monorepo with three apps (API, Web, Mobile) and a shared library. Supports multi-user family-based budgeting with role-based access, transaction management, asset tracking, investment projections, OCR receipt scanning, voice input, and multi-currency support.

---

## 2. Monorepo Structure

```
family-budget-tracker/
├── apps/
│   ├── api/              # Express.js backend (Port 3001)
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Database models
│   │   └── src/
│   │       ├── index.ts             # Server entry
│   │       ├── app.ts               # Express setup, CORS, routes
│   │       ├── routes/              # auth, transaction, category, asset, investment, dashboard, ocr, family
│   │       ├── controllers/         # Request handlers
│   │       ├── services/            # Business logic (Prisma queries)
│   │       ├── middleware/          # authenticate, requireFamily, requireRole, validate, errorHandler
│   │       └── lib/                 # prisma client, ocr engine
│   ├── web/              # React SPA (Port 5173)
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── App.tsx              # Routes + QueryClient
│   │       ├── pages/               # Login, Register, Dashboard, Transactions, Assets, Investments, Family, Settings
│   │       ├── components/          # transactions/, dashboard/, assets/, investments/, family/, layout/
│   │       ├── api/
│   │       │   ├── client.ts        # Axios + interceptors (auto-refresh JWT)
│   │       │   └── hooks/           # React Query hooks for all entities
│   │       ├── store/authStore.ts   # Zustand (user, tokens, currency, family)
│   │       └── utils/               # exchangeRate.ts, useCurrency hook
│   └── mobile/           # React Native + Expo
│       └── src/
│           ├── screens/             # Login, Dashboard, Transactions, Assets, Investments
│           ├── navigation/          # RootNavigator, TabNavigator
│           └── store/               # Zustand + AsyncStorage
└── packages/
    └── shared/           # @family-budget/shared
        └── src/
            ├── types/               # All TypeScript interfaces
            ├── schemas/             # Zod validation schemas
            ├── utils/               # date, compound-interest, categorization
            └── constants/           # currencies (9), categories (22 default)
```

---

## 3. Tech Stack

| Layer       | Technology                                                   |
|-------------|--------------------------------------------------------------|
| Backend     | Express 4.18, TypeScript 5.3, Prisma 5.8, PostgreSQL        |
| Frontend    | React 18, Vite 5, TailwindCSS 3.4, Recharts 2.10           |
| Mobile      | React Native 0.73, Expo 52, React Navigation 6              |
| State       | Zustand 4.5 (web + mobile)                                  |
| Data Fetch  | TanStack React Query 5.17 (web)                             |
| Validation  | Zod 3.22 (shared across API + frontend)                     |
| Auth        | JWT (access 15min + refresh 7day), bcryptjs                  |
| OCR         | Tesseract.js 7 (+ optional Google Cloud Vision)             |
| Currency    | Frankfurter API (free, cached 1hr in localStorage)           |
| Deploy      | Docker (multi-stage), Render.com                             |

---

## 4. Database Schema (Prisma)

### Models & Key Fields

| Model              | Key Fields                                                                 | Relations                          |
|--------------------|----------------------------------------------------------------------------|------------------------------------|
| **User**           | id, email (unique), passwordHash, firstName, lastName                      | → memberships, transactions        |
| **Family**         | id, name                                                                   | → members, transactions, categories|
| **FamilyMember**   | userId, familyId, role (ADMIN/MEMBER/VIEWER)                               | → user, family                     |
| **RefreshToken**   | id, token (unique), expiresAt, userId                                      | → user                            |
| **Category**       | id, name, icon, color, type (INCOME/EXPENSE), isSystem, familyId?          | → family, transactions             |
| **Transaction**    | id, amount, currency (def INR), description, date, type, inputMethod       | → category, user, family, tags     |
|                    | originalAmount?, originalCurrency?, exchangeRate? *(multi-currency)*       |                                    |
| **TransactionTag** | id, tag, transactionId (unique: tag+txn)                                   | → transaction                      |
| **Asset**          | id, name, type (PROPERTY/VEHICLE/INVESTMENT/GOLD/etc), purchaseValue, currentValue | → family, valueHistory       |
| **AssetValueHistory** | id, value, date, assetId                                                | → asset                           |
| **Budget**         | id, month, year, amount, categoryId?, familyId                             | → category, family                 |
| **DashboardLayout** | id, userId, familyId, layout (JSON)                                       | → user, family                     |
| **InvestmentConfig** | id, familyId (unique), savingsPercentage, expectedReturnRate, projectionYears | → family                       |

### Enums
- `TransactionType`: INCOME, EXPENSE
- `InputMethod`: MANUAL, VOICE, OCR
- `FamilyRole`: ADMIN, MEMBER, VIEWER
- `AssetType`: PROPERTY, VEHICLE, INVESTMENT, GOLD, CASH, CRYPTO, OTHER

---

## 5. API Routes

| Route                        | Methods              | Auth | Description                              |
|------------------------------|----------------------|------|------------------------------------------|
| `/health`                    | GET                  | No   | Health check                             |
| `/api/auth/register`         | POST                 | No   | Register user + optional family          |
| `/api/auth/login`            | POST                 | No   | Returns access + refresh tokens          |
| `/api/auth/refresh`          | POST                 | No   | Refresh access token                     |
| `/api/auth/logout`           | POST                 | No   | Invalidate refresh token                 |
| `/api/transactions`          | GET, POST            | Yes  | List (paginated + filters) / Create      |
| `/api/transactions/summary`  | GET                  | Yes  | Income, expenses, byCategory, byMonth    |
| `/api/transactions/:id`      | GET, PUT, DELETE      | Yes  | Single transaction CRUD                  |
| `/api/categories`            | GET, POST            | Yes  | System + family categories               |
| `/api/categories/:id`        | PUT, DELETE           | Yes  | Update/delete custom categories          |
| `/api/assets`                | GET, POST            | Yes  | List with history / Create               |
| `/api/assets/net-worth`      | GET                  | Yes  | Aggregated by type                       |
| `/api/assets/:id`            | PUT, DELETE           | Yes  | Update/delete asset                      |
| `/api/assets/:id/value`      | POST                 | Yes  | Record value history entry               |
| `/api/investments/config`    | GET, PUT             | Yes  | Investment projection settings           |
| `/api/investments/projection`| GET                  | Yes  | Compound interest projections            |
| `/api/dashboard/layout`      | GET, PUT             | Yes  | Custom widget layout (JSON)              |
| `/api/dashboard/summary`     | GET                  | Yes  | Month summary + net worth + recent txns  |
| `/api/ocr/scan`              | POST (multipart)     | Yes  | Upload receipt → extract transaction data|
| `/api/family/members`        | GET                  | Yes  | List family members                      |
| `/api/family/invite`         | POST                 | Yes  | Add member by email                      |
| `/api/family/members/:id`    | PUT, DELETE           | Yes  | Update role / Remove member              |

---

## 6. Frontend Pages & Components

### Pages
| Page             | Path              | Key Features                                      |
|------------------|-------------------|---------------------------------------------------|
| Login            | `/login`          | Email/password auth                               |
| Register         | `/register`       | Create user + family                              |
| Dashboard        | `/`               | 7-widget draggable grid (react-grid-layout)       |
| Transactions     | `/transactions`   | Monthly view, filters, summary cards              |
| Assets           | `/assets`         | Net worth by type, value history                  |
| Investments      | `/investments`    | Config, projections, 50/30/20 allocation tips     |
| Family           | `/family`         | Members list, invite, role management             |
| Settings         | `/settings`       | Global currency selector, profile display         |

### Dashboard Widgets
NetSavingsCard, NetWorthWidget, RecentTransactions, IncomeExpenseChart, CategoryPieChart, MonthlyTrendLine, BudgetProgress

### Transaction Components
- **TransactionForm** - Multi-method input (manual/voice/OCR), currency selector, auto-conversion
- **TransactionList** - Paginated with input method icons, original currency display
- **VoiceInput** - Speech-to-text for amount/description
- **ReceiptScanner** - Camera/upload → OCR → auto-fill form

---

## 7. Authentication Flow

1. Register/Login → server returns `accessToken` (15min) + `refreshToken` (7day)
2. Tokens stored in Zustand → persisted to localStorage (web) / AsyncStorage (mobile)
3. Axios interceptor adds `Authorization: Bearer <accessToken>` to all requests
4. On 401 → interceptor auto-refreshes using refresh token
5. On refresh failure → logout, redirect to login
6. Refresh tokens stored in DB for server-side revocation

### Roles: ADMIN (full control), MEMBER (CRUD transactions), VIEWER (read-only, future enforcement)

---

## 8. Key State Management

### Zustand Auth Store (web: `apps/web/src/store/authStore.ts`)
```typescript
{
  user: User | null,
  family: Family | null,
  accessToken: string | null,
  refreshToken: string | null,
  currency: string,  // Default: 'INR' — global currency setting
}
```
Persisted as `family-budget-auth` in localStorage.

---

## 9. Multi-Currency System (In-Progress Feature)

### How it works:
1. **Global currency** set in Settings page → stored in Zustand auth store
2. **Per-transaction currency** selector in TransactionForm
3. If transaction currency ≠ global currency → auto-converts using Frankfurter API
4. Original amount, currency, and exchange rate saved to DB for audit trail
5. TransactionList shows original currency as secondary text

### Files involved:
- `apps/web/src/utils/exchangeRate.ts` — API client with 1hr cache
- `apps/web/src/components/transactions/TransactionForm.tsx` — Currency picker + conversion
- `apps/web/src/components/transactions/TransactionList.tsx` — Original currency display
- `packages/shared/src/schemas/transaction.schema.ts` — Zod schema with new fields
- `packages/shared/src/types/transaction.ts` — TypeScript types with new fields
- `apps/api/prisma/schema.prisma` — New DB columns
- `apps/api/src/services/transaction.service.ts` — Persist conversion data

### Supported Currencies (9):
INR, USD, EUR, GBP, AED, SGD, AUD, CAD, JPY

---

## 10. Build & Run

```bash
# Install all workspaces
npm install

# Seed default categories (run once after first db push / on a fresh Supabase)
npm run db:seed

# Dev mode (from root)
npm run dev          # Starts API (3001) + Web (5173) concurrently

# Individual apps
npm run dev:api      # API only
npm run dev:web      # Web only

# Build shared package (needed before API/Web builds)
cd packages/shared && npm run build

# Database
npx prisma generate  # Generate client (from apps/api/)
npx prisma db push   # Push schema to DB (from apps/api/)
npx prisma studio    # DB GUI

# Docker
docker-compose up    # PostgreSQL + Redis
docker build -f apps/api/Dockerfile .  # Build API image
```

---

## 11. Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/family_budget
JWT_ACCESS_SECRET=<32-byte hex>
JWT_REFRESH_SECRET=<32-byte hex>
GOOGLE_CLOUD_VISION_API_KEY=optional
PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
```

---

## 12. Deployment

| Layer    | Platform          | Notes                                      |
|----------|-------------------|--------------------------------------------|
| API      | Render.com        | Docker (multi-stage, Node 20-Alpine), auto-deploy from GitHub |
| Web UI   | Cloudflare Pages  | Auto-deploy from GitHub, build: `npm run build:web` |
| Database | Supabase          | PostgreSQL, host: `db.nirnunfospcbcesglgnj.supabase.co:5432` |

### GitHub Repo
`https://github.com/ShadishKumar/family_budget`

### Cloudflare Pages Build Settings
- **Build command**: `cd packages/shared && npm run build && cd ../../apps/web && npm run build`
- **Build output directory**: `apps/web/dist`
- **Environment variable**: `VITE_API_URL=https://<your-render-app>.onrender.com/api`

### Render Environment Variables (set in Render dashboard)
```
DATABASE_URL=postgresql://postgres:<password>@db.nirnunfospcbcesglgnj.supabase.co:5432/postgres
JWT_ACCESS_SECRET=<32-byte hex>
JWT_REFRESH_SECRET=<32-byte hex>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://<your-app>.pages.dev
```

### Supabase
- **Project ref**: `nirnunfospcbcesglgnj`
- **Connection**: Use **Session pooler** URL (not Direct) — direct connection is IPv6-only and fails on Windows/Render
  - Session pooler host: `aws-1-us-east-1.pooler.supabase.com:5432`
  - User format: `postgres.nirnunfospcbcesglgnj`
- **Free tier note**: pauses after 7 days inactivity — resume at supabase.com dashboard

---

## 13. Environment Variables Reference

| Variable | Used by | Where to set |
|----------|---------|--------------|
| `DATABASE_URL` | API | `apps/api/.env` (local), Render dashboard (prod) |
| `JWT_ACCESS_SECRET` | API | `apps/api/.env` (local), Render dashboard (prod) |
| `JWT_REFRESH_SECRET` | API | `apps/api/.env` (local), Render dashboard (prod) |
| `FRONTEND_URL` | API (CORS) | `apps/api/.env` (local), Render dashboard (prod) |
| `PORT` | API | `apps/api/.env` (local), Render dashboard (prod) |
| `VITE_API_URL` | Web | `apps/web/.env` (local), Cloudflare Pages env (prod) |

Template files (committed, safe to share):
- `apps/api/.env.example`
- `apps/web/.env.example`

### Switching DB for local dev (SQLite vs Supabase)
To use local SQLite (offline):
1. `apps/api/.env` → `DATABASE_URL="file:./dev.db"`
2. `apps/api/prisma/schema.prisma` → change provider to `"sqlite"`, remove all `@db.Decimal` and `Json` annotations
3. Run `npx prisma db push` from `apps/api/`

To switch back to Supabase:
1. `apps/api/.env` → restore PostgreSQL URL
2. `apps/api/prisma/schema.prisma` → provider back to `"postgresql"`, restore `@db.Decimal` and `Json` annotations
3. Run `npx prisma generate` from `apps/api/`

---

## 14. Architecture Decisions

1. **Monorepo with npm workspaces** — shared types/schemas ensure API ↔ frontend type safety
2. **Zod schemas in shared package** — single source of truth for validation (API + frontend)
3. **Zustand over Redux** — simpler, less boilerplate for this scale
4. **React Query for server state** — cache invalidation, optimistic updates, auto-refetch
5. **Prisma** — type-safe DB queries, easy migrations, built-in studio
6. **JWT with refresh rotation** — stateless auth with revocation capability
7. **Shared package dual export** — CommonJS for Node.js API, ESM for Vite/browser
8. **Frankfurter API** — free currency rates, no API key needed, cached to avoid rate limits
