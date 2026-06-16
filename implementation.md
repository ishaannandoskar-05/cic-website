# Implementation

## Project Overview

The CIC Club project is a full-stack Coding & Innovation Club portal. The frontend is a React 19 + Vite single-page application, while the backend is an Express + MongoDB API using JWT authentication, role-based admin access, file uploads, analytics, leaderboard data, daily coding quests, and compiler execution.

## Frontend

- Entry point: `src/main.jsx`
- Main application: `src/App.jsx`
- API wrapper: `src/services/api.js`
- Styling: `src/index.css` with Tailwind CSS utility classes and custom dark-mode overrides.
- Build tool: Vite with `@vitejs/plugin-react` and `@tailwindcss/vite`.

The frontend keeps most UI screens in `src/App.jsx`. It defines shared auth and theme contexts, then renders routes through React Router:

- `/` for student/admin login and registration.
- `/home` for the member dashboard overview.
- `/platform`, `/dashboard`, `/leaderboard`, and `/quests` for student-facing activity.
- `/announcements`, `/calendar`, `/resources`, and `/gallery` for club content.
- `/admin` and nested admin pages for CRUD management.

Authentication state is stored through JWTs in `localStorage`. The `api` helper attaches the bearer token to requests and supports JSON and `FormData` bodies for image uploads.

## Backend

- API entry point: `backend/server.js`
- Database connection: `backend/config/db.js`
- Auth middleware: `backend/middleware/auth.js`
- Routes: `backend/routes/*.js`
- Models: `backend/models/*.js`
- Upload helper: `backend/utils/upload.js`
- Compiler client: `backend/utils/onlineCompilerClient.js`

The backend mounts these route groups:

- `/api/auth` for register, login, profile, and current-user lookup.
- `/api/announcements` for announcement CRUD.
- `/api/events` for calendar event CRUD.
- `/api/resources` for learning-resource CRUD with image uploads.
- `/api/gallery` for gallery image CRUD and gallery stats.
- `/api/quests` for daily coding quest CRUD.
- `/api/submissions` for submitting and reviewing quest solutions.
- `/api/members` for admin member management and XP updates.
- `/api/leaderboard` for ranked users.
- `/api/analytics` for student/admin dashboard metrics.
- `/api/compiler` for code execution, templates, runtimes, and XP awards.

MongoDB models cover users, quests, submissions, events, announcements, resources, and gallery images. Users include role, XP, streak, solved count, contest rating, projects built, and join date fields.

## Data Flow

1. A student or admin signs in through the React auth page.
2. The backend validates credentials and returns a JWT.
3. The frontend stores the token and sends it on all API calls.
4. Protected backend routes resolve `req.user` from the JWT.
5. Admin-only routes use the `admin` middleware.
6. Frontend pages load data through `src/services/api.js`.
7. Admin forms create or update MongoDB records.
8. Upload routes store images through the upload utility.
9. Daily quest code execution sends language, code, and test cases to `/api/compiler/execute`.
10. Passing all tests can award XP and update user activity metadata.

## Local Scripts

Root frontend scripts:

- `npm run dev` starts the Vite frontend.
- `npm run build` creates the production frontend bundle in `dist`.
- `npm run lint` runs ESLint.
- `npm run preview` serves the built frontend.

Backend scripts:

- `npm run dev` starts the Express API with nodemon from `backend`.
- `npm start` starts the Express API with Node from `backend`.

## Deployment and Runtime Notes

The repository contains Docker-related files for a compiler sandbox and an API/Mongo deployment flow:

- `docker.compose.yml` describes API and MongoDB services.
- `dockerfile.sandbox` appears to define the sandbox image.
- `BUILD_SANDBOX.SH` builds and validates the sandbox image.

The Vite config proxies `/api` to `http://localhost:5000`, so local development expects the backend to run on port `5000`.

## Verification Performed

- `npm.cmd run build` completed successfully.
- `node --check backend/server.js` completed successfully.
- `node --check backend/routes/compiler.js` failed because the compiler route has duplicate declarations.
- `npm.cmd run lint` did not finish within the two-minute command timeout.

