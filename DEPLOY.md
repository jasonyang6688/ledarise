# Ledarise — Docker Deployment

Production-ready single-host deployment with Docker Compose. Three services:

| Service | Tech | Port | Image |
|---|---|---|---|
| `mysql` | MySQL 8.0 | 3306 (localhost only) | mysql:8.0 |
| `backend` | Go + Gin | 8080 | built from `./backend` |
| `frontend` | Next.js 14 (standalone) | 3000 | built from `./frontend` |

## Quick start

```bash
# 1. Configure environment (only required step)
cp .env.example .env
# edit .env — at minimum, change JWT_SECRET to a long random string

# 2. Build images and start the stack
docker compose up -d --build

# 3. Watch logs
docker compose logs -f

# 4. Stop
docker compose down

# 5. Stop AND wipe MySQL data + uploaded files
docker compose down -v
```

The frontend will be at <http://localhost:3000>, backend at <http://localhost:8080>.
Default admin login: `admin@ledarise.com / admin123`.

## Architecture notes

```
┌────────────┐    public       ┌──────────────┐  internal  ┌──────────┐
│  Browser   │ ──────────────► │  Next.js     │ ─────────► │ Backend  │
│            │                 │  Frontend    │            │  (Go)    │
│            │ ────────────────────────────────────────►   │          │
└────────────┘   public API     └──────────────┘             └─────┬────┘
                                                                   │
                                                            ┌──────▼────┐
                                                            │  MySQL    │
                                                            └───────────┘
```

- `PUBLIC_API_BASE_URL` is written into `/runtime-config.js` when the frontend
  container starts. Use `https://api.example.com` when the backend is on a
  separate public origin, or `/` when your reverse proxy serves the backend from
  the same origin under `/api/...`.
- After changing `PUBLIC_API_BASE_URL`, recreate the frontend container:
  `docker compose up -d --force-recreate frontend`.
- The backend retries the MySQL connection up to 30 times (every 2s) at
  startup, so the order of container readiness is robust.
- MySQL is only exposed on `127.0.0.1:3306` of the host. To make it fully
  internal, comment out the `ports:` block in the `mysql` service.
- `backend_uploads` volume persists Excel uploads across container restarts.
- Run `docker compose exec mysql mysql -uroot -p` to enter the DB shell.

## Production hardening checklist

- [ ] Set a strong `JWT_SECRET` (min 32 random chars) in `.env`.
- [ ] Set a strong `MYSQL_ROOT_PASSWORD`. Consider creating a dedicated app user.
- [ ] Put a TLS-terminating reverse proxy (Caddy / Traefik / Nginx) in front
      and update `ALLOWED_ORIGINS` + `PUBLIC_API_BASE_URL` to the HTTPS URL.
- [ ] Add an off-host backup of the `mysql_data` volume.
- [ ] Tighten `ALLOWED_ORIGINS` to the exact frontend origin (no wildcards).
- [ ] Rotate the default admin password immediately after first login.
- [ ] Consider using Docker Swarm or systemd to auto-restart on host reboot.

## Common operations

```bash
# Rebuild a single service (backend changes)
docker compose build backend && docker compose up -d backend

# Rebuild frontend after API URL change
docker compose build --no-cache frontend && docker compose up -d frontend

# Tail backend logs
docker compose logs -f backend

# Open a MySQL shell
docker compose exec mysql mysql -uroot -p ledarise_db

# Backup the database
docker compose exec mysql mysqldump -uroot -p ledarise_db > backup.sql

# Restore
cat backup.sql | docker compose exec -T mysql mysql -uroot -p ledarise_db

# Inspect health
docker compose ps
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Frontend shows "Network Error" on every request | `PUBLIC_API_BASE_URL` mismatches the URL the browser actually reaches. Rebuild frontend after fixing. |
| Backend logs `mysql unreachable after 30 attempts` | MySQL container failed health check — check `docker compose logs mysql`, verify `MYSQL_ROOT_PASSWORD` matches both services. |
| 401 on every admin request | Token expired (24h) — re-login. Or `JWT_SECRET` changed and old tokens are now invalid. |
| Excel upload fails with 413 | File over 50MB — increase `MAX_UPLOAD_SIZE_MB` env on the backend service. |
| Port 3000 / 8080 already taken | Set `FRONTEND_PORT` / `BACKEND_PORT` in `.env` to an unused port. |
