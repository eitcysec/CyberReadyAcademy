# ADR 001: Initial architecture and stack

- **Status:** Proposed (awaiting CTO review). Amended 2026-10-25 after CTO review: toolchain moved from Node 22 to Node 24 LTS.
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

| Concern         | Choice                                            | Version (exact)    |
| --------------- | ------------------------------------------------- | ------------------ |
| Runtime         | Node.js 24 LTS                                    | 24.22.1 (≥24.15.0) |
| Package manager | npm with `package-lock.json` (bundled with Node)  | ≥11.19.1           |
| Framework       | Next.js, App Router, Turbopack build              | 16.4.1             |
| UI              | React; plain CSS and CSS Modules                  | 19.3.0             |
| Language        | TypeScript, `strict` + `noUncheckedIndexedAccess` | 6.0.3              |
| Validation      | Zod                                               | 4.6.6              |
| Lint / format   | ESLint (`eslint-config-next`) / Prettier          | 9.39.5 / 3.9.10    |
| Unit tests      | Vitest, jsdom, Testing Library                    | 5.0.3              |
| CI              | GitHub Actions                                    | n/a                |

### Version selection rule

Use the newest stable release **published at least 14 days before installation**, which
reduces exposure to compromised or broken fresh releases. Exceptions are recorded here.

## Deviations from the proposed direction

1. **Next.js 16.4.1 instead of 16.4.0 (exception to the 14-day rule).** 16.4.0 was the
   newest release meeting the rule, but `npm audit` reported two critical and one high
   advisory against it (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r),
   all fixed in 16.4.1. 16.4.1 was 11 days old. A known critical remote-code-execution
   issue outweighs the freshness rule, so the smallest patched version was chosen.
2. **npm 11.19.1 or newer is required.** npm 10.9.7 crashed
   (`Cannot read properties of null (reading 'edgesOut')`) on an optional
   peer-dependency cycle (vitest → vite → `@vitejs/devtools` → vitest). npm 11 resolves
   it. npm 11.9.0 installs the tree but ignores the `allowScripts` policy and runs the
   denied `unrs-resolver` postinstall; 11.19.1 and 11.21.0 honour it. 11.19.1 is the
   version bundled with Node 24.22.x, so no separate npm install is needed. The rejected
   alternative, `--legacy-peer-deps`, would switch off peer-dependency checks for every
   developer.
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

## Toolchain policy (amended after CTO review)

**One toolchain everywhere: Node 24 LTS with its bundled npm**, for local development, CI
and the future deployment.

- `.nvmrc` pins the exact version (**24.22.1**); CI reads it through
  `actions/setup-node`. Deployment must use the same major and patch.
- `package.json` `engines` states what the lockfile can actually run on:
  `node ^24.15.0` (the lowest Node 24 that `jsdom` 30.1.2 and its dependencies accept)
  and `npm >=11.19.1` (the lowest tested npm that honours `allowScripts`).
  `engine-strict=true` stays on.
- **Why not Node 22:** maintenance-only since 2025-10-21 and end of life 2027-04-30, so a
  deployment started now would need a runtime migration within months. The previous pin,
  22.22.2, was also missing three later security releases (22.23.0, 22.23.2, 22.23.4).
- **Why not Node 26:** it becomes LTS on 2026-10-28, too recently for the ecosystem and
  this project's freshness rule. Revisit in 2027. Node 24 is supported until 2028-04-30.
- **Why the previous `<23` cap existed:** it limited installs to the single major line I
  had tested. No dependency required it. It also excluded Node 24, which was
  unnecessary. (Node 23 is end of life and several dependencies reject it anyway.)
- **Security releases are exempt from the 14-day freshness rule.** 24.22.1 (released
  2026-10-21) fixes 7 CVEs. When Node publishes a security release, update `.nvmrc`
  promptly. Raise the `engines` floor only when a dependency requires it.

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
- Developers need Node 24.15.0 or newer (24.22.1 recommended) with its bundled npm 11.19.1 or newer. `engine-strict` makes a wrong version fail loudly.
- Strict pinning means upgrades are deliberate. A process for regular dependency
  updates is still needed (see roadmap).

## Unresolved decisions

Hosting provider; Prisma or Drizzle; authentication library; email and WhatsApp
providers; analytics (if any); data-protection obligations for Liberian and regional
clients.
