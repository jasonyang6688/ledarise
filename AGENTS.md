# Repository Guidelines

## Project Structure & Module Organization

Ledarise is a two-service e-commerce repository. `backend/` contains the Go Gin/GORM REST API, with handlers in `handlers/`, middleware in `middleware/`, database setup and seed data in `database/`, models in `models/`, and shared helpers in `utils/`. `frontend/` is a Next.js 14 App Router app; routes live under `frontend/src/app`, reusable UI under `frontend/src/components`, and API/auth/cart utilities under `frontend/src/lib`. Product requirements and source data live in `docs/`. `ui-desgin/` is the original design reference; keep the typo and treat it as read-only.

## Build, Test, and Development Commands

- `docker compose up -d --build`: build and run MySQL, backend, and frontend.
- `docker compose logs -f backend`: follow backend logs.
- `cd backend && go run .`: run the API locally on `:8080` with local MySQL.
- `cd backend && go build ./... && go vet ./...`: verify backend compilation and static checks.
- `cd frontend && npm run dev`: run the frontend on `:3000`.
- `cd frontend && npm run build`: build Next.js and run production checks.
- `cd frontend && npm run lint`: run the configured Next.js ESLint rules.

## Coding Style & Naming Conventions

Format Go with `gofmt`; keep handlers thin and return responses through `backend/utils/response.go` helpers instead of raw `c.JSON`. Backend JSON uses `snake_case`. Frontend TypeScript uses strict mode, `PascalCase` components, `camelCase` internal fields, and explicit raw-to-UI mapping in `frontend/src/lib/api.ts`. Preserve the existing inline styles and global CSS classes; do not rewrite the design into Tailwind utilities.

## Testing Guidelines

There is no committed test suite yet. For now, verify changes with `go build ./...`, `go vet ./...`, `npm run build`, and `npm run lint`. When adding tests, use Go `*_test.go` files near the package under test and frontend `*.test.ts(x)` files near the relevant component or library.

## Commit & Pull Request Guidelines

The visible frontend history only contains the initial Create Next App commit, so use concise conventional commits such as `feat: add product filters` or `fix: handle expired admin token`. PRs should describe user-visible changes, list verification commands, note env or schema changes, and include screenshots for UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for Docker runs and change `JWT_SECRET`, MySQL credentials, and production origins before deployment. `NEXT_PUBLIC_API_BASE_URL` is baked into the frontend bundle, so rebuild the frontend after changing it.
