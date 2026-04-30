# Ledarise Backend

Go + Gin + GORM backend for the Ledarise e-commerce platform.

## Requirements

- Go 1.21+
- MySQL 8.0 (user `root` with password `jason6688`, or update `.env`)

## Quick Start

```bash
# 1. Ensure MySQL is running and root user has access
# 2. The server auto-creates the database on first run

cd backend
go run .
```

Server starts on `http://localhost:8080`.

## Default Admin Credentials

- Email: `admin@ledarise.com`
- Password: `admin123`
- Role: `super_admin`

Seeded automatically on first run if `admin_users` table is empty.

## API Base Paths

- Public: `http://localhost:8080/api/v1/`
- Admin (JWT): `http://localhost:8080/api/admin/`
- Health: `http://localhost:8080/healthz`

## Login Example

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ledarise.com","password":"admin123"}'
```

## Notes

- `float64` is used for prices in this skeleton. Production should use `github.com/shopspring/decimal`.
- All admin routes except login require `Authorization: Bearer <token>` header.
- `/api/admin/users/*` routes require `super_admin` role.

## Reference

See `/docs/Ledarise_PRD_v2.md` for full product requirements.
