# CRA-001 implementation report

- **Task:** CRA-001, secure project foundation, architecture and CI
- **Date:** 2026-10-25
- **Status:** Ready for review. Not committed, pushed or deployed.
- **Evidence:** `docs/reports/evidence/` (full command logs)

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

| Proposed                    | Implemented                             | Reason                                                                                                                                             |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js, maintained release | **16.4.1**                              | 16.4.0 had 2 critical and 1 high advisory; 16.4.1 is the first patched release. Breaks the 14-day freshness rule (11 days old); recorded exception |
| npm (implied by Node)       | **npm 11.21.0 required**                | npm 10.9.7 crashes on the dependency tree's optional peer cycle                                                                                    |
| ESLint (latest)             | **ESLint 9.39.5 (end of life)**         | Next.js's lint plugins do not support ESLint 10 yet                                                                                                |
| TypeScript (latest)         | **TypeScript 6.0.3**                    | `typescript-eslint` does not support TypeScript 7                                                                                                  |
| PostgreSQL + Prisma         | **Deferred**, PostgreSQL still intended | No feature in CRA-001 stores data. Prisma vs Drizzle is open for proposed CRA-002                                                                  |
| Playwright                  | **Not installed**                       | No browser flows yet; HTTP smoke test used instead                                                                                                 |
| Component system            | **Plain CSS Modules**                   | Four static pages do not justify a library                                                                                                         |
| Modular monolith            | As proposed                             | `src/app/(public)`, `src/modules/*`, `src/lib`                                                                                                     |

## 4. Commands executed and results

Environment: Ubuntu 24.04 sandbox, Node v22.22.2, npm 11.21.0. The final run was done on
a clean copy of exactly the files to be delivered (no `node_modules`, `.next` or
`.env.local`), with `SITE_URL=http://localhost:3000` as in CI. Full log:
`evidence/CRA-001-ci-run.log`.

| #   | Command                               | Result                                                                                                                                    |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm ci`                              | **Pass.** 429 packages, `found 0 vulnerabilities`; deprecation warning for eslint@9.39.5                                                  |
| 2   | `npm run format:check`                | **Pass**                                                                                                                                  |
| 3   | `npm run lint` (`--max-warnings=0`)   | **Pass**                                                                                                                                  |
| 4   | `npm run typecheck`                   | **Pass**                                                                                                                                  |
| 5   | `npm test`                            | **Pass.** 3 files, 16 tests                                                                                                               |
| 6   | `npm run build`                       | **Pass.** 4 static routes                                                                                                                 |
| 7   | `npm audit` / `npm audit --omit=dev`  | **Pass.** 0 vulnerabilities                                                                                                               |
| 8   | `npm audit signatures`                | **Not validated.** Sandbox DNS blocked `tuf-repo-cdn.sigstore.dev` (ENOTFOUND). Runs in CI                                                |
| 9   | `npm start` + `curl` smoke test       | **Pass.** `/`, `/services`, `/contact` → 200; unknown path → 404; titles correct; one `<h1>`; security headers present; no `X-Powered-By` |
| 10  | `actionlint .github/workflows/ci.yml` | **Pass.** actionlint 1.7.12, no findings (shellcheck not available)                                                                       |

Additional checks run during development:

- **Build without `SITE_URL`:** fails with `SITE_URL is required but not set` (expected).
- **Server start without `SITE_URL`:** fails in the instrumentation hook, and requests
  get connection refused (expected). See `evidence/CRA-001-startup-failure.log`.
- **Lint probe:** a temporary file using `eval` was rejected by `no-eval`, which proves
  the security lint rules are active. The file was deleted.
- **Source grep** for `NODE_TLS_REJECT_UNAUTHORIZED`, `rejectUnauthorized`, `eval(`,
  `new Function` and `dangerouslySetInnerHTML`: no matches.

**Not validated:** the workflow running on GitHub; `npm audit signatures`; visual
rendering in a real browser (no browser in the sandbox, so layout, colour contrast and
keyboard focus were not visually checked); Windows and macOS setup.

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

- The server process stays alive after a failed startup validation. It serves nothing,
  but a supervisor needs a health check to notice.
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
5. Package signatures not verified in this environment.
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
closes AC-05 and the signature check.

## 10. Acceptance criteria

| AC    | Criterion             | Status            | Notes                                                                                                                                                  |
| ----- | --------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-01 | Repository integrity  | **Met**           | Sandbox inspected (no repo, no files); nothing overwritten; file list in §2. The owner's own environment was not accessible                            |
| AC-02 | Reproducible setup    | **Met**           | `npm ci` from lockfile on a clean copy; no secrets needed. Requires npm 11 (documented)                                                                |
| AC-03 | Application execution | **Met**           | Starts with `npm start`; pages return 200 with correct titles; semantic, responsive markup; no false service claims. Not visually checked in a browser |
| AC-04 | Code quality          | **Met**           | Lint, type check, tests and build pass                                                                                                                 |
| AC-05 | CI                    | **Partially met** | Workflow exists, passes actionlint, and its steps all pass locally. Not yet run on GitHub                                                              |
| AC-06 | Security baseline     | **Met**           | No secrets; placeholder example; ignore rules; audit triaged; threat model complete. Signature check pending CI                                        |
| AC-07 | Architecture docs     | **Met**           | ADR, architecture and roadmap match the implementation                                                                                                 |
| AC-08 | Evidence quality      | **Met**           | Every result above has a logged command; unrun checks are marked as such                                                                               |

Work stops here, awaiting CTO review and Product Owner approval. CRA-002 has not been
started.
