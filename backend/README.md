# Spark English Kids — API (ASP.NET Core 8)

REST API for the Spark English Kids site: accounts, courses & schedules, free-trial bookings, contact messages and an admin dashboard.

**Stack:** C# · ASP.NET Core 8 · EF Core 8 · SQLite (dev) / PostgreSQL (prod) · JWT · FluentValidation · Swagger · xUnit

## Architecture

```
src/
  SparkEnglish.Domain          entities + enums (no dependencies)
  SparkEnglish.Application     DTOs, service interfaces, FluentValidation validators, exceptions
  SparkEnglish.Infrastructure  EF Core DbContext, service implementations, JWT + BCrypt, seeding
  SparkEnglish.Api             controllers, middleware (ProblemDetails errors), rate limiting, Swagger
tests/SparkEnglish.Tests       integration tests (WebApplicationFactory + isolated SQLite DB)
```

Dependencies point inward: Api → Infrastructure → Application → Domain.

## Run locally

```bash
cd src/SparkEnglish.Api
dotnet run          # http://localhost:5128 — Development config seeds the admin below
```

Swagger UI: <http://localhost:5128/swagger> — log in via `POST /api/auth/login`, click **Authorize**, paste the token.
Dev admin: `admin@sparkenglishkids.com` / `ChangeMe123!` (Development environment only).

## Configuration

| Key (env var) | Purpose |
|---|---|
| `Jwt__Secret` | **Required**, 32+ chars. The app refuses to start without it. |
| `Admin__Email`, `Admin__Password`, `Admin__Name` | Admin account created on first start. No password → no admin seeded. |
| `Database__Provider` | `Sqlite` (default) or `Postgres` |
| `ConnectionStrings__Default` | Connection string |
| `Cors__Origins` | Comma-separated allowed browser origins |
| `RateLimiting__FormsPerMinute` / `AuthPerMinute` | Per-IP limits on public forms / auth |

## Endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | signed in |
| GET | `/api/courses`, `/api/courses/{id}` | public (with schedules) |
| POST/PUT/DELETE | `/api/courses[/{id}]`, `/api/courses/{id}/schedules[/{sid}]` | Admin |
| POST | `/api/trial-requests` | public (linked to user if token sent) |
| GET | `/api/trial-requests/me` | signed in |
| GET | `/api/trial-requests?status=&search=&page=&pageSize=` | Admin |
| PATCH | `/api/trial-requests/{id}/status` | Admin (`Pending/Contacted/Scheduled/Cancelled`) |
| DELETE | `/api/trial-requests/{id}` | Admin |
| POST | `/api/messages` | public |
| GET | `/api/messages?unreadOnly=&page=&pageSize=` | Admin |
| PATCH/DELETE | `/api/messages/{id}/read`, `/api/messages/{id}` | Admin |
| GET | `/api/admin/stats` | Admin |
| GET | `/health` | public |

Errors are RFC 7807 `ProblemDetails`; validation failures return `errors: { field: [messages] }`.

## Tests

```bash
dotnet test
```

## Docker + PostgreSQL

```bash
JWT_SECRET=$(openssl rand -hex 32) ADMIN_PASSWORD='choose-a-strong-one' docker compose up --build
```

## Notes

- **Schema:** PostgreSQL uses versioned EF Core migrations, applied automatically on startup. SQLite (local dev / tests) creates the schema directly.
- Add a migration after changing entities:
  ```bash
  dotnet tool install -g dotnet-ef --version 8.0.11
  dotnet ef migrations add <Name> --project src/SparkEnglish.Infrastructure --output-dir Persistence/Migrations
  ```
- Passwords are hashed with BCrypt; tokens are HS256 JWTs carrying a `Role` claim (`Parent` / `Admin`).
