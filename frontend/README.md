# Spark English Kids — Frontend

React 19 + TypeScript + Vite single-page app: bilingual (EN/IT) marketing site with live course data, free-trial booking, contact form, login/register and an admin dashboard. Talks to the [ASP.NET Core API](../backend-dotnet).

**Stack:** React 19 · TypeScript (strict) · Vite · React Router · TanStack Query · React Hook Form + Zod

## Run

```bash
cp .env.example .env.local      # VITE_API_BASE=http://localhost:5128/api
npm install
npm run dev                     # http://localhost:5173
```
Start the API first (`cd ../backend-dotnet/src/SparkEnglish.Api && dotnet run`).

Scripts: `npm run dev | build | preview | typecheck | lint`.

## Structure

```
src/
  api/          types.ts (API contracts), client.ts (fetch + ProblemDetails errors), hooks.ts (TanStack Query hooks)
  context/      AuthContext (JWT in localStorage, auto-logout on 401)
  i18n/         copy.ts (EN/IT, type-checked to have identical keys), I18nContext
  components/   Navbar, AuthModal (accessible dialog), Mascot (hero SVG), Field, Reveal, ...
  sections/     Hero, Courses, Pricing (live from API), Contact (trial form + slot picker), MessageForm, ...
  pages/admin/  lazy-loaded dashboard: stats, trial triage, messages, course & schedule CRUD
  lib/          course helpers, API fallback data, confetti
```

## Notes
- Courses and pricing come from `GET /api/courses`. If the API is unreachable the page falls back to the three standard formats so it never looks empty (forms then show a friendly error on submit).
- Forms validate client-side with Zod; server `400` field errors are mapped back onto the form.
- `public/_redirects` makes `/admin` work as an SPA route on Netlify.
- Respects `prefers-reduced-motion`; dialog traps focus and closes on Escape.
