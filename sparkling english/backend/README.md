# Spark English Kids — Backend

Spring Boot 3 / Java 17 REST API backing the site's login (parent accounts + admin) and
the trial-request / contact-message forms. PostgreSQL for storage, JWT for auth.

## Prerequisites

- JDK 17+ ([Eclipse Temurin](https://adoptium.net/) is a good choice)
- Maven 3.9+
- PostgreSQL running locally (or update `DB_URL`/`DB_USER`/`DB_PASSWORD` to point elsewhere)

## First-time setup

```bash
createdb spark_english_kids   # or: psql -c "CREATE DATABASE spark_english_kids;"
```

Tables are created/updated automatically on startup (`spring.jpa.hibernate.ddl-auto=update`).

## Configuration

All settings live in `src/main/resources/application.properties` and can be overridden with
environment variables — **change these before deploying anywhere real**:

| Env var | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/spark_english_kids` | JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `postgres` / `postgres` | DB credentials |
| `JWT_SECRET` | dev placeholder | HMAC signing key for JWTs (32+ bytes) |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Token lifetime |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | `admin@sparkenglishkids.com` / `ChangeMe123!` / `Tina` | Seeded admin account (created once on first startup if it doesn't exist) |
| `CORS_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:8081` | Origins allowed to call the API from a browser — add wherever you serve `index.html` from |

## Running

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Log in as the seeded admin with
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults above) to see the admin dashboard at
`admin.html` on the frontend.

## Serving the frontend

`index.html` calls `API_BASE = "http://localhost:8080/api"` (see the `<script>` at the
bottom of the file). Serve the frontend from any static server (e.g. VS Code Live Server,
`python -m http.server`) whose origin is included in `CORS_ORIGINS`, or add yours.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create a parent account, returns a JWT |
| POST | `/api/auth/login` | none | Log in, returns a JWT |
| GET | `/api/auth/me` | any logged-in user | Current user's profile |
| POST | `/api/trial-requests` | none (attaches current user if logged in) | Submit the "book a free trial" form |
| GET | `/api/trial-requests` | ADMIN | List all trial requests |
| GET | `/api/trial-requests/me` | any logged-in user | List the current user's own trial requests |
| POST | `/api/messages` | none (attaches current user if logged in) | Submit the "send a message" form |
| GET | `/api/messages` | ADMIN | List all contact messages |

### Example

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Rossi","email":"alex@email.com","password":"secret123"}'

curl http://localhost:8080/api/trial-requests \
  -H "Authorization: Bearer <admin-token-from-login>"
```
