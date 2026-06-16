# Bug Report

## Confirmed Issues

### 1. Backend compiler route has duplicate declarations

- Severity: Critical
- File: `backend/routes/compiler.js`
- Evidence: `node --check backend/routes/compiler.js` fails at line 477 with `SyntaxError: Identifier 'STARTER_TEMPLATES' has already been declared`.
- Impact: The backend cannot safely import the compiler route. Since `backend/server.js` imports `./routes/compiler.js`, the API server is likely to fail during startup.
- Cause: The file appears to contain one complete compiler implementation, then continues after `export default router;` with another compiler implementation.
- Recommended fix: Replace `backend/routes/compiler.js` with a single implementation. `backend/routes/compiler_new.js` appears to contain the shorter non-duplicated version and may be the intended source.

### 2. Docker file naming/configuration is inconsistent

- Severity: High
- Files: `docker.compose.yml`, `dockerfile.sandbox`, `BUILD_SANDBOX.SH`
- Evidence:
  - Compose references an API `Dockerfile`, but no root `Dockerfile` was found.
  - Comments and scripts reference `Dockerfile.sandbox`, while the repository contains `dockerfile.sandbox`.
  - The compose file is named `docker.compose.yml`, while common Docker Compose defaults are `docker-compose.yml` or `compose.yml`.
- Impact: Docker startup/build steps can fail, especially on case-sensitive Linux hosts.
- Recommended fix: Add the missing API Dockerfile or update compose to the intended file. Rename `dockerfile.sandbox` or update scripts to use its exact filename. Consider renaming `docker.compose.yml` to a standard compose filename.

### 3. Hardcoded production-sensitive secrets and credentials

- Severity: High
- Files: `backend/config/db.js`, `backend/routes/auth.js`, `backend/middleware/auth.js`, `backend/server.js`
- Evidence:
  - MongoDB Atlas URI with credentials is used as a fallback in `backend/config/db.js`.
  - JWT secret has a hardcoded fallback.
  - Admin registration secret has a hardcoded fallback.
  - A default admin account is seeded with a known password.
- Impact: Anyone with source access can connect to the database or forge/guess privileged access if environment variables are missing.
- Recommended fix: Remove secret fallbacks, require environment variables at startup, rotate exposed credentials, and disable or gate default admin seeding outside local development.

### 4. Build emits CSS selector warnings

- Severity: Medium
- File: `src/index.css`
- Evidence: `npm.cmd run build` succeeds but reports four generated CSS optimization warnings around selectors such as `[data-dark="true"] .bg-\[#1a1a1a\]`.
- Impact: Some dark-mode override selectors may be ignored or optimized incorrectly, causing inconsistent colors in production.
- Recommended fix: Escape Tailwind arbitrary-value class selectors with valid CSS escaping, or replace those selectors with maintainable semantic classes.

### 5. Lint command does not complete in reasonable time

- Severity: Medium
- File: repository layout / `eslint.config.js`
- Evidence: `npm.cmd run lint` timed out after roughly two minutes.
- Impact: Developers may not be able to rely on linting before commits.
- Likely cause: The repository contains a nested `cic-club` project copy, `dist`, and multiple `node_modules` directories. ESLint may be traversing too much of the workspace.
- Recommended fix: Add explicit ignores for `node_modules`, `dist`, nested copied projects, build outputs, and archives. Consider scoping the script to `eslint src`.

## Additional Risks

### 6. Repository contains duplicated project artifacts

- Severity: Medium
- Evidence: A nested `cic-club` folder contains another frontend/backend copy, build output, and dependencies.
- Impact: Searches, linting, packaging, and human review become noisy and error-prone.
- Recommended fix: Remove the nested copy if it is accidental, or document it as an archive and exclude it from tooling.

### 7. Frontend bundle is large

- Severity: Low
- Evidence: Vite warns that the generated JS chunk is larger than 500 kB after minification.
- Impact: Initial page load can be slower than necessary.
- Recommended fix: Split admin pages, charts, gallery, and compiler UI with dynamic imports.

### 8. Text encoding corruption appears in multiple files

- Severity: Low
- Files: `MIGRATION_GUIDE.md`, `docker.compose.yml`, `BUILD_SANDBOX.SH`, `backend/server.js`, `src/App.jsx`
- Evidence: Symbols render as mojibake sequences such as `âœ…`, `â”€`, and `â†’`.
- Impact: Documentation, console logs, and UI labels look unpolished and may confuse users.
- Recommended fix: Normalize files to UTF-8 and replace corrupted sequences with plain ASCII or valid Unicode.

## Verification Log

- Frontend build: Passed with warnings.
- Backend server syntax check: Passed.
- Compiler route syntax check: Failed with duplicate declaration.
- Lint: Timed out.

