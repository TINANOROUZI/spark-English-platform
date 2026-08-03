# Spark English Kids — Frontend

React + Vite single-page app for the Spark English Kids marketing site: home page (hero,
courses, activities, age tracks, teachers, pricing, FAQ, trial-booking form, contact form)
plus an admin dashboard, talking to the [backend](../backend) over REST.

## Prerequisites

- Node.js 20+ and npm
- The backend running at `http://localhost:8080` (see `../backend/README.md`)

## Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` by default — already included in the backend's default
`CORS_ORIGINS`.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Project structure

```
src/
  api/client.js          fetch wrapper + auth/trial-requests/messages endpoints
  context/AuthContext.jsx login/register/logout, JWT persisted in localStorage
  i18n/                   EN/IT copy + language context (persisted in localStorage)
  components/             Navbar, AuthModal, Reveal (scroll-in animation), BackgroundDecor, Footer
  sections/               Hero, Courses, Activities, Ages, Teachers, Pricing, Faq, Contact, MessageForm
  pages/HomePage.jsx       composes all sections for "/"
  pages/AdminPage.jsx      admin-only dashboard for "/admin" (trial requests + messages)
```

## Configuration

The API base URL defaults to `http://localhost:8080/api`. Override it by creating a
`.env.local` file:

```
VITE_API_BASE=http://localhost:8080/api
```
