# ASSISTANT.md

This file provides guidance to the assistant (claude.ai/code) when working with code in this repository.

## Project overview

Ledarise is an e-commerce platform for premium hair systems sold to US/UK/DE markets. It is a **two-service monorepo**:

- `backend/` — Go 1.25 + Gin + GORM + MySQL 8.0, REST API on `:8080`
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind, on `:3000`
- `docker-compose.yml` at repo root orchestrates both + MySQL for dev/prod
- `docs/Ledarise_PRD_v2.md` — authoritative product spec (DB schema, API contract, page list)
- `ui-desgin/` (sic, typo intentional) — original React/JSX design prototype that the frontend was ported from. Reference only — do not modify.

## Common commands

### Local development (no Docker)

```bash
# Backend — requires MySQL running locally on 127.0.0.1:3306, root/jason6688
cd backend && go run .                    # starts on :8080, auto-creates DB, seeds admin + 12 products / 12 customers / 15 orders

# Frontend — separate terminal
cd frontend && npm run dev                # starts on :3000, NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8080
```

### Build / lint / verify

```bash
# Backend
cd backend && go build ./... && go vet ./...

# Frontend (also runs ESLint + tsc as part of next build)
cd frontend && npm run build
cd frontend && npm run lint
```

There is no test suite yet. Verification is done via `go build`/`go vet` and `npm run build` plus curl-based smoke tests of running services.

### Docker compose (production-shaped)

```bash
cp .env.example .env                                     # then edit JWT_SECRET etc.
docker compose up -d --build                             # all 3 services
docker compose logs -f backend                           # tail one service
docker compose build frontend && docker compose up -d    # required when PUBLIC_API_BASE_URL changes (it is baked in at build time)
docker compose down -v                                   # nuke including mysql_data + backend_uploads volumes
```

### Default credentials & ports

- Admin login: `admin@ledarise.com / admin123` (seeded on first DB init; rotate in production)
- MySQL: `root / jason6688`, db `ledarise_db` (auto-created on first run)
- Excel test fixture: `cd backend && go run ./cmd/gen-test-xlsx /tmp/ledarise-test.xlsx` produces a 12-row file (10 valid, 1 missing SKU, 1 duplicate)

## Architecture

### Response envelope (mandatory across all endpoints)

The backend wraps every JSON response in `{ code, message, data }` (see `backend/utils/response.go`). Paginated lists use `data: { list, total, page, page_size }`. Use `utils.Success`, `utils.Page`, `utils.Error` — never write `c.JSON` directly. The frontend's `lib/api.ts` `request<T>()` helper unwraps this envelope and throws `ApiError` on non-200 codes.

### Backend layering

`main.go` → `config.Load()` → `database.Init()` → `router.New()`. The router wires public `/api/v1/*` routes (no auth) and `/api/admin/*` routes (JWT-guarded by `middleware.Auth()`); `/api/admin/users/*` additionally requires `middleware.RequireSuperAdmin()`. Handlers in `handlers/` are thin — they bind input, call GORM via `database.DB`, and use the response helpers. Business logic that spans multiple steps lives in `services/` (currently only `import_service.go`).

`database/mysql.go` uses a `waitForMySQL` retry loop (30 × 2s) before opening GORM, so the backend is robust to MySQL containers that aren't ready yet. After `AutoMigrate`, it calls `seedAdmin()` then `SeedData()` (in `database/seed.go`), both of which are idempotent — they no-op if the relevant table already has rows.

### Type mapping (snake_case ↔ camelCase)

The Go API returns `snake_case` JSON. The frontend keeps `camelCase` internal types. The bridge is in `frontend/src/lib/api.ts`:

- `interface Raw{Product,Customer,Order,...}` describes wire format
- `mapProduct/mapOrder/mapCustomer` convert + parse special fields
- `Product.features` is stored as a JSON-encoded string column server-side and parsed in the mapper
- `Order` fields collapse: `order_no→orderNo`, `shipping_amount→shipping`, `grand_total→total`, `purchased_at→date`, `order_items[].quantity→items[].qty`, ship_* fields composed into `shipAddress`
- `flagFor(country)` synthesizes 🇺🇸/🇬🇧/🇩🇪 from country name when backend doesn't supply one

When extending the API: define both raw and mapped types, update mappers, and put new methods in the right namespace under `export const api = { auth, publicProducts, publicOrders, products, orders, customers, dashboard, imports }`.

### Frontend page conventions

Every page is a **client component** (`'use client'` at top). Server components don't work because pages use Zustand, localStorage, event handlers. Routing uses `useRouter()` from `next/navigation` and `useSearchParams()`. The original design's `navigate(path)` pattern was rewritten to `router.push`.

Admin pages (except `/admin/login`) wrap their content in `<RequireAuth>` (see `components/admin/RequireAuth.tsx`) which redirects to `/admin/login` if no token is present in the Zustand auth store.

### Auth flow

1. `lib/auth.ts` — Zustand store with `persist` middleware, key `ledarise.auth`
2. On login, the token is mirrored to a separate localStorage key `ledarise.token`
3. `lib/api.ts` `request()` reads `ledarise.token` and sets `Authorization: Bearer <token>` automatically
4. On 401, `request()` clears both keys and (only if currently in `/admin/*`) redirects to `/admin/login`

### Excel import (PRD §8 — core business capability)

`POST /api/admin/orders/import` accepts a multipart `.xlsx`, saves to `UPLOAD_DIR` with a UUID filename, calls `services.StartImport(path)` which spawns a goroutine and returns a `task_id`. Progress is held in a `sync.Map` keyed by task_id (process-local; capped at 20 most recent tasks). The frontend `ImportDialog` polls `GET /api/admin/orders/import/:task_id` every 2s.

Three-tier dedup: customers by `(name, phone)`, products by `sku`, orders by `order_no`. Inserts batch-flush every 500 rows in their own GORM transaction; one bad batch only rolls back its own batch and continues. Address parsing splits `"Ship-to Address"` on `, ` then regex-splits `street + city`. Country IDs (`US`/`GB`/`DE`) normalize to full names. Status `"COMPLETE"` lowercases to `"complete"`. Every row is wrapped in `defer recover()` — parsing must NEVER panic.

### Cart (frontend-only)

Zustand store `lib/cart.ts` with `persist` middleware → `localStorage['ledarise.cart']`. There is no server-side cart. The cart only becomes a real Order when the customer submits checkout (`POST /api/v1/orders`), at which point the backend computes totals and shipping (free over $300 subtotal, otherwise $25 standard / $45 express) — never trust client-supplied totals.

### Styling

Heavy reliance on **inline styles + custom CSS classes** from `globals.css` (ported verbatim from the original design's `styles.css`) — `.btn`, `.admin-card`, `.product-card`, `.eyebrow`, `.serif`, `.nav-item`, `.badge-*`, status colors via CSS variables. Tailwind directives are present but utility classes are used sparingly. Do not rewrite inline styles to Tailwind; preserve the design fidelity. The `Icon` object in `components/icons.tsx` exports all SVG icons by name (`Icon.Search`, `Icon.Cart`, etc.).

### Frontend env variables

`NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`) is the URL the **browser** uses, not the Docker network. It is baked into the client JS bundle at build time. After changing it in `.env`, `docker compose build frontend` is required.

## Conventions to maintain

- Backend: prices use `float64` in this skeleton (PRD calls for `decimal`; flagged in `backend/README.md` as a production TODO). Status/role enums are `VARCHAR` with Go string constants in models — no DB enum types.
- Frontend: TypeScript strict mode. No `any` in committed code. No `console.log`.
- Both: every `Bash` command MUST use absolute paths or `--prefix`/`-C`. Do not rely on shell `cd` persistence between tool invocations — it does not stick.
- The directory `ui-desgin/` keeps the typo (it's a directory name, not a code symbol). Do not "fix" it.
