# Architecture

_Describes what exists after CRA-001. Planned elements are marked as planned._

## Overview

A single Next.js application (App Router, TypeScript), structured as a **modular
monolith**. It runs as one Node.js process, has no database and makes no outbound network
calls. All four current routes are prerendered as static HTML at build time.

```
Browser ──HTTPS (at deploy)──▶ Next.js server (Node 24 LTS)
                                 ├─ src/app/(public)   public website (static pages)
                                 ├─ src/modules/       business modules (catalog only, static data)
                                 └─ src/lib/           cross-cutting helpers (env validation)
                                        (planned) ──▶ PostgreSQL
```

## Directory layout

```
src/
  app/
    layout.tsx            root HTML shell and metadata (reads validated SITE_URL)
    globals.css           design tokens, base styles, focus and reduced-motion rules
    not-found.tsx         404 page
    (public)/             public website route group (no URL prefix)
      layout.tsx          skip link, header, nav, footer
      page.tsx            landing page                     → /
      services/page.tsx   planned-course catalog           → /services
      contact/page.tsx    inquiry placeholder, no form     → /contact
      CourseList.tsx      shared catalog presentation
      public.module.css   public-site styles
  modules/
    catalog/catalog.ts    typed static catalog data; every entry is "planned"
  lib/
    env.ts                Zod schema for environment variables
  instrumentation.ts      validates configuration once at server startup
  test/setup.ts           test environment setup
```

### Boundaries

- **Public website**: `src/app/(public)`. The route group keeps public pages together
  without affecting URLs.
- **Business modules**: `src/modules/<name>`. Each module owns its types, data access and
  rules. Pages import from modules; modules never import from `src/app`. Only `catalog`
  exists today.
- **Internal operations (planned)**: `src/app/(internal)`, served under an authenticated
  path such as `/dashboard`. Not created yet.
- **Customer portals (planned)**: `src/app/(portal)` for organisation and learner areas.
  Not created yet.

The module rule is a convention today. Once there is more than one module, an ESLint
import-restriction rule should enforce it.

## Configuration

Environment variables are validated by `src/lib/env.ts` (Zod) at startup and build. Only
`SITE_URL` exists. Secrets will be added to the same schema when needed and must come
from the environment, never from source files.

## Rendering and security headers

- Pages are server components with no client-side JavaScript of their own (Next.js's
  runtime still loads).
- `next.config.ts` sets CSP, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` and `Permissions-Policy` on every route, and disables
  `X-Powered-By`.
- Pages send `robots: noindex, nofollow` until launch.

## Testing

Vitest with jsdom and Testing Library. Tests sit next to their code (`*.test.ts[x]`) and
cover environment validation, catalog invariants and the rendered landing and inquiry
pages. Browser end-to-end tests with Playwright are planned but not installed.

## Data and persistence

None. See ADR 001 §Database for the strategy and integration boundary.

## Deployment

None. The build output needs a Node 24 host (≥24.15.0; 24.22.1 pinned). Hosting choice is deferred (roadmap).
