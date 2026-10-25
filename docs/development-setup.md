# Development setup

## Prerequisites

| Tool    | Version                | Why                                                                                       |
| ------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| Node.js | 22.x, at least 22.12.0 | Active LTS line. Pinned in `.nvmrc` (22.22.2) and enforced by `engines` in `package.json` |
| npm     | 11.21.0 or newer       | npm 10 crashes while resolving this dependency tree (see ADR 001)                         |
| Git     | any recent version     | Version control                                                                           |

`.npmrc` sets `engine-strict=true`, so `npm ci` stops with a clear error when the Node or
npm version is wrong, rather than producing a subtly different install.

```bash
nvm use                    # or install Node 22 another way
npm install -g npm@11.21.0
node --version && npm --version
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

- at server startup (`src/instrumentation.ts`), where the server refuses to serve
  requests if configuration is invalid;
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
