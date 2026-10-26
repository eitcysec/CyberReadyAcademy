# Development setup

## Prerequisites

| Tool    | Version                                   | Why                                                                                                                         |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Node.js | 24 LTS: **24.22.1** recommended, ≥24.15.0 | `.nvmrc` pins the exact version CI uses. `engines` allows `^24.15.0`, the lowest version the lockfile's dependencies accept |
| npm     | ≥11.19.1 (bundled with Node 24.22.x)      | Older npm 11 releases ignore the `allowScripts` install-script policy; npm 10 crashes on this tree                          |
| Git     | any recent version                        | Version control                                                                                                             |

The project supports Node 24 LTS only, pinned to 24.22.1. Node 24 releases older than
24.15.0 are not supported because the pinned `jsdom` toolchain requires Node
`^22.22.2 || ^24.15.0 || >=26`. Although that dependency range includes Node 22.22.2,
project policy deliberately standardises on Node 24 only (see ADR 001, "Toolchain policy").

`.npmrc` sets `engine-strict=true`, so `npm ci` stops with a clear error when the Node or
npm version is wrong, rather than producing a subtly different install.

```bash
nvm use                    # reads .nvmrc (24.22.1); or install Node 24.22.1 another way
node --version && npm --version   # v24.22.1 and 11.19.1 or newer
```

## Install

```bash
npm ci
```

Always use `npm ci` rather than `npm install` for a normal setup: it installs exactly the
versions recorded in `package-lock.json` and fails if the lockfile and `package.json`
disagree. Use `npm install <pkg>@<exact-version>` only when deliberately changing
dependencies. `.npmrc` sets `save-exact=true`.

Install scripts: npm 11 blocks dependency install scripts unless they are approved in
`package.json` under `allowScripts`. The only package that requests one,
`unrs-resolver`, is explicitly denied because its script only downloads a fallback
binary that is not needed. Review any new request with `npm install-scripts ls`.

### Windows (PowerShell)

Validated on Windows by the Product Owner on 2026-10-25 with Node.js v24.22.1 and npm 11.19.1:
`npm run check`, `npm audit`, `npm audit --omit=dev` and `npm audit signatures` passed
(`docs/reports/evidence/4-windows-node24/12-windows-validation.log`). The Node installation commands and `npm run dev` below are not covered by
that transcript.

```powershell
node --version            # must print v24.15.0 or newer; v24.22.1 recommended
npm --version             # must print 11.19.1 or newer
# If Node is older, install 24.22.1 with nvm-windows:
#   nvm install 24.22.1; nvm use 24.22.1
# or the official Windows installer for v24.22.1 from nodejs.org.
npm ci
Copy-Item .env.example .env.local
npm run check
npm run dev
```

## Configure

```bash
cp .env.example .env.local
```

| Variable   | Required | Example (placeholder)   | Purpose                             |
| ---------- | -------- | ----------------------- | ----------------------------------- |
| `SITE_URL` | yes      | `http://localhost:3000` | Absolute base URL for page metadata |

`.env.local` and every other `.env*` file except `.env.example` are git-ignored. No real
secret is needed for anything in CRA-001.

Validation lives in `src/lib/env.ts` and runs:

- at server startup (`src/instrumentation.ts`): if configuration is invalid, the server
  logs the problem and answers **every request with a generic `HTTP 500 Internal Server
Error`** (no page content, no configuration details; security headers still sent). The
  process does **not** exit, so a deployment needs a health check;
- during `npm run build`, which fails with a message such as
  `SITE_URL is required but not set`.

Error messages name the variable and the problem but never print its value.

## Run

```bash
npm run dev                        # development, http://localhost:3000
npm run build && npm start         # production build, http://localhost:3000
npm start -- -p 3100               # different port
```

Set `NEXT_TELEMETRY_DISABLED=1` in your shell if you do not want Next.js to send
anonymous usage telemetry.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

`npm run check` runs the first five in order. CI runs all of them, plus
`npm audit signatures`, on every pull request (`.github/workflows/ci.yml`).

## Database

There is no database in CRA-001. PostgreSQL is the intended database and arrives with
the persistence task; see ADR 001 and the roadmap. Do not add SQLite as a stand-in.
