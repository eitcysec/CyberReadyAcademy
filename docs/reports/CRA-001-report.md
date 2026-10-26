# CRA-001 implementation report

- **Task:** CRA-001, secure project foundation, architecture and CI
- **Date:** 2026-10-25
- **Status:** Revised after CTO review (2026-10-25); Windows validation run by the Product Owner recorded (§4a); awaiting CTO re-review and Product Owner approval; **not accepted**. Not committed, pushed or deployed.
- **Evidence:** `docs/reports/evidence/`; see its `README.md` for the provenance of every file

## 0. CTO review remediation (2026-10-25)

**Finding 1, missing evidence.** Cause: `.gitignore` contained `*.log`, so the evidence
logs were excluded from the ZIP. In addition, two of the three original evidence files
were hand-written summaries, not raw logs, and one contained an incorrect result: with
`SITE_URL` missing the server does **not** refuse connections. It keeps running and
answers every request with a generic HTTP 500 (the original request was made after
`timeout` had killed the process). Remediation: a `.gitignore` exception; raw originals
kept; hand-written files labelled `NOT-RAW`; every required check rerun with raw
capture, both against the delivered ZIP on the original toolchain and against the
patched tree on Node 24. Wording corrected in this report, the setup guide and the
threat model.

**Finding 2, Windows toolchain mismatch.** Reproduced on Linux with the CTO's Node
24.14.0 / npm 11.9.0. Root causes:

1. The `<23` cap was my choice to limit installs to the one major line I had tested. No
   dependency required it, and it needlessly excluded Node 24.
2. Independently of the cap, **Node 24.14.0 cannot install this lockfile**: `jsdom`
   30.1.2 and three of its dependencies require Node `^22.22.2 || ^24.15.0 || >=26`.
   The declared floor `>=22.12.0` was also wrong for the same reason.
3. npm 11.9.0 installs the tree but **ignores `allowScripts`** and runs the denied
   `unrs-resolver` postinstall.
4. The Node 22.22.2 pin was missing three Node 22 security releases (22.23.0, 22.23.2,
   22.23.4), and Node 22 reaches end of life on 2027-04-30.

**Decision:** standardise on **Node 24 LTS, 24.22.1** (the latest security release),
with its bundled **npm >=11.19.1**, for local development, CI and deployment. `engines`
becomes `node ^24.15.0, npm >=11.19.1`; `engine-strict` stays on. See ADR 001,
"Toolchain policy".

**Patch scope.** Changed: `.nvmrc`, `package.json` (engines, packageManager),
`package-lock.json` (root `engines` block only, 2 lines), `.gitignore`,
`.github/workflows/ci.yml` (global npm install removed; prints versions), README,
development setup, architecture, ADR 001, threat model, security baseline and this
report. Added: the evidence files under `docs/reports/evidence/`. No dependency versions
and no application code changed. No `--force` or `--legacy-peer-deps`.

**Validated (Linux, Node 24.22.1 / npm 11.19.1):** npm ci, format, lint, type check,
16/16 tests, build, both audits (0 vulnerabilities), smoke test and headers, startup
failure behaviour, actionlint. **Not validated in the Linux sandbox:** Windows; `npm audit
signatures` (sandbox DNS); GitHub Actions; a real browser. Windows and `npm audit
signatures` were subsequently verified by the Product Owner on Windows (§4a). GitHub Actions and a
real-browser review remain outstanding.

## 1. Summary

A minimal, reproducible Next.js 16 / TypeScript foundation for CyberReady Academy:

- Three public pages (landing, planned courses, inquiry placeholder) and a 404 page, all
  statically prerendered. Every course is labelled "planned, not yet bookable" and the
  inquiry page states that nothing can be submitted.
- Startup-time environment validation with Zod. It fails closed and never prints values.
- Baseline security headers.
- Lint, type check, 16 unit and component tests, a production build and a dependency
  audit, all wired into a GitHub Actions workflow.
- The six required documents, plus this report.

**Where the work was done.** The work ran in an ephemeral cloud sandbox from the Claude
chat app, not on the owner's machine or repository. Initial inspection found no Git
repository and no prior files (`fatal: not a git repository`; empty uploads directory),
so no existing work could have been overwritten. A local Git repository was initialised
only to produce the changed-file list. **No commits were made.** The CI workflow has not
run on GitHub; it was validated locally (see §4).

## 2. Repository structure and changed files

All files are new (untracked; no commits). From `git status --porcelain`:

```
?? .editorconfig
?? .env.example
?? .github/workflows/ci.yml
?? .gitignore
?? .npmrc
?? .nvmrc
?? .prettierignore
?? .prettierrc.json
?? README.md
?? docs/adr/001-initial-architecture.md
?? docs/architecture.md
?? docs/development-setup.md
?? docs/reports/CRA-001-report.md
?? docs/roadmap.md
?? docs/security/security-baseline.md
?? docs/security/threat-model.md
?? eslint.config.mjs
?? next.config.ts
?? package-lock.json
?? package.json
?? src/app/(public)/CourseList.tsx
?? src/app/(public)/contact/page.tsx
?? src/app/(public)/layout.tsx
?? src/app/(public)/page.test.tsx
?? src/app/(public)/page.tsx
?? src/app/(public)/public.module.css
?? src/app/(public)/services/page.tsx
?? src/app/globals.css
?? src/app/layout.tsx
?? src/app/not-found.tsx
?? src/instrumentation.ts
?? src/lib/env.test.ts
?? src/lib/env.ts
?? src/modules/catalog/catalog.test.ts
?? src/modules/catalog/catalog.ts
?? src/test/setup.ts
?? tsconfig.json
?? vitest.config.mts
```

## 3. Architecture decisions and deviations

Full detail in `docs/adr/001-initial-architecture.md`. Summary:

| Proposed                    | Implemented                                   | Reason                                                                                                                                             |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js, maintained release | **16.4.1**                                    | 16.4.0 had 2 critical and 1 high advisory; 16.4.1 is the first patched release. Breaks the 14-day freshness rule (11 days old); recorded exception |
| npm (implied by Node)       | **npm >=11.19.1** (bundled with Node 24.22.x) | npm 10.9.7 crashes on the optional peer cycle; npm 11.9.0 ignores `allowScripts`                                                                   |
| ESLint (latest)             | **ESLint 9.39.5 (end of life)**               | Next.js's lint plugins do not support ESLint 10 yet                                                                                                |
| TypeScript (latest)         | **TypeScript 6.0.3**                          | `typescript-eslint` does not support TypeScript 7                                                                                                  |
| PostgreSQL + Prisma         | **Deferred**, PostgreSQL still intended       | No feature in CRA-001 stores data. Prisma vs Drizzle is open for proposed CRA-002                                                                  |
| Playwright                  | **Not installed**                             | No browser flows yet; HTTP smoke test used instead                                                                                                 |
| Component system            | **Plain CSS Modules**                         | Four static pages do not justify a library                                                                                                         |
| Modular monolith            | As proposed                                   | `src/app/(public)`, `src/modules/*`, `src/lib`                                                                                                     |

## 4. Commands executed and results

Original environment: Ubuntu 24.04 sandbox, Node v22.22.2, npm 11.21.0 (now superseded by Node 24.22.1; see §0 and `evidence/3-remediation-node24/`). The final run was done on
a clean copy of exactly the files to be delivered (no `node_modules`, `.next` or
`.env.local`), with `SITE_URL=http://localhost:3000` as in CI. Full log:
`evidence/1-original-run-node22/CRA-001-ci-run.log`.

| #   | Command                               | Result                                                                                                                                                    |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm ci`                              | **Pass.** 429 packages, `found 0 vulnerabilities`; deprecation warning for eslint@9.39.5                                                                  |
| 2   | `npm run format:check`                | **Pass**                                                                                                                                                  |
| 3   | `npm run lint` (`--max-warnings=0`)   | **Pass**                                                                                                                                                  |
| 4   | `npm run typecheck`                   | **Pass**                                                                                                                                                  |
| 5   | `npm test`                            | **Pass.** 3 files, 16 tests                                                                                                                               |
| 6   | `npm run build`                       | **Pass.** 4 static routes                                                                                                                                 |
| 7   | `npm audit` / `npm audit --omit=dev`  | **Pass.** 0 vulnerabilities                                                                                                                               |
| 8   | `npm audit signatures`                | **Not validated in the Linux sandbox.** Sandbox DNS blocked `tuf-repo-cdn.sigstore.dev` (ENOTFOUND). Later verified on Windows by the Product Owner (§4a) |
| 9   | `npm start` + `curl` smoke test       | **Pass.** `/`, `/services`, `/contact` -> 200; unknown path -> 404; titles correct; one `<h1>`; security headers present; no `X-Powered-By`               |
| 10  | `actionlint .github/workflows/ci.yml` | **Pass.** actionlint 1.7.12, no findings (shellcheck not available)                                                                                       |

Additional checks run during development:

- **Build without `SITE_URL`:** fails with `SITE_URL is required but not set` (expected).
- **Server start without `SITE_URL`:** the instrumentation hook fails and logs the problem;
  the process keeps running and answers every request with a generic HTTP 500 (no
  configuration details). _Corrected 2026-10-25: the original text said "connection
  refused"._ See `evidence/3-remediation-node24/07-startup-failure-missing-site-url.log`.
- **Lint probe:** a temporary file using `eval` was rejected by `no-eval`, which proves
  the security lint rules are active. The file was deleted.
- **Source grep** for `NODE_TLS_REJECT_UNAUTHORIZED`, `rejectUnauthorized`, `eval(`,
  `new Function` and `dangerouslySetInnerHTML`: no matches.

**Not validated:** the workflow running on GitHub; visual rendering in a real browser (no
browser in the sandbox, so layout, colour contrast and keyboard focus were not visually
checked); macOS setup. Windows setup and `npm audit signatures` were later verified on
Windows by the Product Owner (§4a).

## 4a. Windows validation (Product Owner, 2026-10-25)

Evidence: `docs/reports/evidence/4-windows-node24/12-windows-validation.log`. Captured by the Product Owner on Windows with Node.js v24.22.1 and npm
11.19.1. The results below are the Product Owner's summary of that transcript; the developer has
not inspected the file.

| Check                                                                   | Result (Windows)                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm run check` (Prettier, ESLint, TypeScript, tests, production build) | Passed                                                                         |
| Unit and component tests                                                | 16/16 passed across 3 test files                                               |
| Production build routes                                                 | `/`, `/_not-found`, `/contact`, `/services`                                    |
| `npm audit`                                                             | 0 vulnerabilities                                                              |
| `npm audit --omit=dev`                                                  | 0 vulnerabilities                                                              |
| `npm audit signatures`                                                  | 428 packages with verified registry signatures; 111 with verified attestations |

The 428 count (against 429 packages on Linux) matches the lockfile's platform-specific
`sharp` packages: two on Linux x64, one on Windows x64. Not covered by the Windows summary:
the install step on its own, `npm start`, the HTTP smoke test and the startup-failure
check, all of which have Linux evidence only.

## 5. Test coverage and known limitations

The 16 tests cover:

- **Environment validation (8):** valid input; missing and empty values; rejection of
  `javascript:`, `ftp:` and relative URLs; the offending value never appearing in errors;
  unrelated variables not passed through.
- **Catalog (3):** unique, URL-safe slugs; every course "planned"; delivery formatting.
- **Pages (5):** a single `<h1>`; the inquiry link goes to `/contact`; every course is
  rendered and marked not bookable; no "book now"-style claims; the inquiry page has no
  form or input fields.

Coverage percentage is not measured (no coverage tool installed).

Known limitations:

- The server process stays alive after a failed startup validation and answers every
  request with HTTP 500, so a supervisor needs a health check to notice.
- The CSP allows `'unsafe-inline'`.
- The module boundary rule is a convention, not enforced by lint.
- ESLint 9 is end of life.
- Page copy is placeholder and needs owner review before launch. Pages send `noindex`.

## 6. Dependency audit findings

| Finding                                         | Severity             | Decision                                                         |
| ----------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| next@16.4.0: GHSA-2464-fhr4-w9xw (RCE)          | Critical             | Fixed: upgraded to 16.4.1                                        |
| next@16.4.0: GHSA-673q-mjm6-r5xr (RCE)          | Critical             | Fixed: upgraded to 16.4.1                                        |
| next@16.4.0: GHSA-p3m5-59mp-jv5r (DoS)          | High                 | Fixed: upgraded to 16.4.1                                        |
| Final tree, all and production-only             | None found           | `found 0 vulnerabilities`                                        |
| eslint@9.39.5 deprecated (end of life)          | Not an advisory      | Accepted, dev-only; see ADR 001                                  |
| `unrs-resolver` install script                  | Supply-chain hygiene | Explicitly denied in `allowScripts`                              |
| `@img/sharp-libvips` license: LGPL-3.0-or-later | License note         | Unmodified library bundled through Next.js; no legal review done |

No findings were suppressed and no audit thresholds were set.

## 7. Remaining security risks

1. No deployment exists, so there is no TLS, HSTS, WAF or rate limiting. These depend on
   hosting.
2. CSP `'unsafe-inline'` (low risk while there is no user input).
3. GitHub settings (branch protection, fork-PR approval, secret scanning) are outside
   the code and must be set by the owner.
4. No automated dependency updates, so new advisories rely on CI failing.
5. Package signatures were verified locally on Windows (§4a) but not yet in CI, because GitHub Actions has not run.
6. Authentication, authorization, sessions, audit logging, tenant isolation and privacy
   controls are **designed only, not implemented**. This foundation is **not** a
   production-ready authenticated environment.
7. This is a developer self-review, **not an independent security assessment**.

## 8. Infrastructure and spending

**No cost incurred and no paid dependency added.** GitHub Actions is free for public
repositories and has a free monthly minutes allowance for private ones; check your plan.
Hosting is not chosen. PostgreSQL will need either Docker locally (free) or a hosted
instance when deployed (cost decision in CRA-005).

## 9. Deferred decisions and recommended next task

Deferred: hosting provider; Prisma vs Drizzle; authentication library; email, WhatsApp
and payment providers; data-protection obligations in Liberia; nonce-based CSP.

**Recommended next task: proposed CRA-002, persistence foundation.** Covers local
PostgreSQL via Docker Compose, the Prisma/Drizzle decision with a small spike, the first
migration, a disposable test database for CI, and least-privilege database roles. Before
starting it, push this foundation to GitHub and confirm the first CI run passes, which
closes AC-05 and confirms the signature check in CI.

## 10. Acceptance criteria

Evidence sources: **Windows (Product Owner)**, the Product Owner's Windows transcript (§4a); **Linux
(developer)**, raw logs in `evidence/1-original-run-node22/`, `2-rerun-delivered-zip-node22/` and `3-remediation-node24/`; **Outstanding**, not yet
evidenced. Statuses describe the evidence. Formal acceptance is a CTO and Product Owner
decision, and CRA-001 has **not** been accepted.

| AC    | Criterion             | Status                                                                                             | Notes                                                                                                                                                                                                                                                                                                                                                  |
| ----- | --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-01 | Repository integrity  | **Met**                                                                                            | Sandbox inspected (no repo, no files); nothing overwritten; file list in §2. The owner's own environment was not accessible                                                                                                                                                                                                                            |
| AC-02 | Reproducible setup    | **Not met as delivered; remediated, evidence now covers Linux and Windows; pending CTO re-review** | Windows (Product Owner): `npm run check` passed on Node 24.22.1 / npm 11.19.1. Linux (developer): clean `npm ci` and full check on the same versions. Delivered (unpatched) engines rejected the Product Owner's Node 24.14.0 / npm 11.9.0                                                                                                             |
| AC-03 | Application execution | **Met (Linux evidence)**                                                                           | Linux (developer): `npm start`; pages return 200 and 404 with correct titles; headers present. Windows (Product Owner): production build generated all four routes; startup and HTTP smoke test not in the summary. Outstanding: real-browser functional review                                                                                        |
| AC-04 | Code quality          | **Met**                                                                                            | Linux (developer) and Windows (Product Owner): format, lint, type check, 16/16 tests and build pass                                                                                                                                                                                                                                                    |
| AC-05 | CI                    | **Partially met**                                                                                  | Linux (developer): workflow passes actionlint and its steps pass locally. Outstanding: **GitHub Actions has not been run or verified**                                                                                                                                                                                                                 |
| AC-06 | Security baseline     | **Met**                                                                                            | Linux (developer): no secrets, placeholder example, ignore rules, audits triaged, threat model. Windows (Product Owner): both audits 0 vulnerabilities; signatures verified (428) with 111 attestations. Outstanding: signature check in CI. Open residual risk: CSP `'unsafe-inline'`. Deployment, TLS/HSTS and production configuration not verified |
| AC-07 | Architecture docs     | **Met**                                                                                            | ADR, architecture and roadmap match the implementation                                                                                                                                                                                                                                                                                                 |
| AC-08 | Evidence quality      | **Not met as delivered; remediated, pending CTO re-review**                                        | Linux (developer): raw logs with provenance; two hand-written files kept and labelled `NOT-RAW`. Windows (Product Owner): transcript indexed with path and environment; not inspected by the developer                                                                                                                                                 |

Remaining before acceptance: a GitHub Actions run (AC-05), CTO re-review of AC-02 and AC-08, and Product Owner approval. Work stops here. CRA-002 has not been
started.
