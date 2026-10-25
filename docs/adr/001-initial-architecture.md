# ADR 001: Initial architecture and stack

- **Status:** Proposed (awaiting CTO review)
- **Date:** 2026-10-25
- **Task:** CRA-001

## Context

CyberReady Academy is a one-person business with a small budget. The product starts as a
public website and grows into internal operations tools and, later, customer portals. The
foundation must be cheap to run, easy for one developer to maintain, and secure by
default, since the business sells security awareness.

## Decision

### Application shape

One **modular monolith**: a single Next.js application whose public site, internal
modules and future portals are separated by folder and import boundaries, not by
services. Microservices would add deployment, networking and cost overhead with no
benefit at this scale.

### Stack as built

| Concern         | Choice                                            | Version (exact) |
| --------------- | ------------------------------------------------- | --------------- |
| Runtime         | Node.js LTS                                       | 22.x (≥22.12)   |
| Package manager | npm with `package-lock.json`                      | 11.21.0+        |
| Framework       | Next.js, App Router, Turbopack build              | 16.4.1          |
| UI              | React; plain CSS and CSS Modules                  | 19.3.0          |
| Language        | TypeScript, `strict` + `noUncheckedIndexedAccess` | 6.0.3           |
| Validation      | Zod                                               | 4.6.6           |
| Lint / format   | ESLint (`eslint-config-next`) / Prettier          | 9.39.5 / 3.9.10 |
| Unit tests      | Vitest, jsdom, Testing Library                    | 5.0.3           |
| CI              | GitHub Actions                                    | n/a             |

### Version selection rule

Use the newest stable release **published at least 14 days before installation**, which
reduces exposure to compromised or broken fresh releases. Exceptions are recorded here.

## Deviations from the proposed direction

1. **Next.js 16.4.1 instead of 16.4.0 (exception to the 14-day rule).** 16.4.0 was the
   newest release meeting the rule, but `npm audit` reported two critical and one high
   advisory against it (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r),
   all fixed in 16.4.1. 16.4.1 was 11 days old. A known critical remote-code-execution
   issue outweighs the freshness rule, so the smallest patched version was chosen.
2. **npm 11 is required, not the npm 10 bundled with Node 22.** npm 10.9.7 crashed
   (`Cannot read properties of null (reading 'edgesOut')`) on an optional
   peer-dependency cycle (vitest → vite → `@vitejs/devtools` → vitest). This also
   happened with Vitest 4.1.12. npm 11.21.0 resolves the tree correctly. The rejected
   alternative, `--legacy-peer-deps`, would switch off peer-dependency checks for every
   developer. npm 11 also blocks dependency install scripts unless approved, which is a
   useful supply-chain control.
3. **ESLint 9 instead of 10, despite ESLint 9 being end of life.** `npm ci` warns that
   eslint@9.39.5 is no longer supported. However, `eslint-config-next` depends on
   `eslint-plugin-react` (latest 7.37.5) and `eslint-plugin-jsx-a11y` (latest 6.10.2),
   and neither declares ESLint 10 support, so using ESLint 10 would need peer overrides
   and an untested combination. ESLint is a development-only tool that never runs in
   production. Upgrade once Next.js's lint plugins support ESLint 10.
4. **TypeScript 6 instead of 7.** `typescript-eslint` supports TypeScript below 6.1 only.
5. **Playwright not installed.** No browser flows exist yet. It is added with the first
   interactive feature, the inquiry form. An HTTP smoke test with `curl` covers CRA-001.
6. **No database client installed.** See the next section.
7. **No component library.** Four static pages do not justify one. Revisit when internal
   screens begin.
8. **System font stacks, no web fonts.** No external font requests (privacy, CSP and
   speed on slow connections), and no font files to license or host.

## Database

**Decision: deferred out of CRA-001.** Nothing in CRA-001 stores or reads data, and
adding a database now would mean either running PostgreSQL locally through Docker or
paying for a hosted instance, without any feature to justify it.

- **Intended database:** PostgreSQL. **No SQLite stand-in**, because SQL dialect and type
  differences would hide bugs until production.
- **Integration boundary:** each module in `src/modules/<name>/` will own a data-access
  file (for example `catalog/repository.ts`) exposing typed functions. Pages and route
  handlers call those functions and never the database client directly. Today
  `catalog.ts` returns static data through this same shape, so moving to the database
  will not change any page code.
- **Configuration:** `DATABASE_URL`, added to the Zod schema in `src/lib/env.ts` at that
  point. It is commented out in `.env.example` today.
- **Planned task:** proposed **CRA-002, persistence foundation**. It covers local
  PostgreSQL via Docker Compose, the database-access library choice, migrations, a
  disposable test database, and least-privilege database roles.
- **Open decision (for CRA-002): Prisma or Drizzle.** Prisma offers a mature migration
  workflow and schema-first modelling, at the cost of a heavier generated client and its
  own schema language. Drizzle is lighter, stays closer to SQL and is written in plain
  TypeScript, but its migration tooling has historically been less mature. Both are
  actively maintained and permissively licensed.

## Consequences

- One deployable unit and one CI job keep costs and maintenance low.
- Folder boundaries are only conventions until a lint rule enforces them.
- Developers must install npm 11. `engine-strict` makes a wrong version fail loudly.
- Strict pinning means upgrades are deliberate. A process for regular dependency
  updates is still needed (see roadmap).

## Unresolved decisions

Hosting provider; Prisma or Drizzle; authentication library; email and WhatsApp
providers; analytics (if any); data-protection obligations for Liberian and regional
clients.
