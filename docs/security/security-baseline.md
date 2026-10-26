# Security baseline

_Status of each control after CRA-001. "In place" means implemented and checked in this
task; it is not a certification. Informed by the OWASP Top 10 and OWASP ASVS, without a
formal ASVS assessment._

## Task requirements

| #   | Requirement                                      | Status   | Evidence / notes                                                                                                      |
| --- | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | No secrets in source control                     | In place | No secrets exist; `.gitignore` excludes `.env*` (except the example) and key files                                    |
| 2   | No hard-coded production credentials             | In place | Only configuration is `SITE_URL`, read from the environment                                                           |
| 3   | No unnecessary public endpoints                  | In place | Build output: 4 static routes, no API routes, no Server Actions                                                       |
| 4   | No unsafe dynamic code execution                 | In place | ESLint `no-eval`, `no-implied-eval`, `no-new-func`, `react/no-danger` set to error; checked with a probe file         |
| 5   | No disabling TLS verification                    | In place | No `NODE_TLS_REJECT_UNAUTHORIZED` and no `rejectUnauthorized: false` anywhere                                         |
| 6   | No unnecessary permissions / privileged DB roles | In place | No database; CI token is `contents: read`                                                                             |
| 7   | Safe error handling                              | Partial  | Env errors never print values (tested). Production Next.js hides stack traces from visitors. No custom error page yet |
| 8   | Versions pinned through lockfile                 | In place | `package-lock.json`, exact versions, `save-exact=true`, `npm ci` in CI                                                |
| 9   | Audit findings recorded and triaged              | In place | See "Dependency audit log" below                                                                                      |
| 10  | No suppressed findings                           | In place | No audit exceptions or `--audit-level` thresholds; CI fails on any finding                                            |
| 11  | CI does not expose secrets to untrusted PR code  | In place | `pull_request` trigger, no secrets, read-only token, `persist-credentials: false`                                     |
| 12  | Future controls documented                       | In place | "Planned controls" below                                                                                              |

## HTTP response headers

Set for every route in `next.config.ts` (confirmed with `curl -I` against the production
server):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`X-Powered-By` is disabled. **HSTS is not set by the application**: it only works over
HTTPS and belongs with the deployment task.

**Known weakness:** the CSP allows `'unsafe-inline'` scripts, which Next.js needs for its
inline bootstrap code unless a per-request nonce is used. Nonces force every page to
render dynamically. Today there is no user input that could inject script, so the risk
is low. Moving to a nonce-based CSP is planned for when the first form ships.

## Dependency audit log

| Date       | Command                                                                              | Result                                                                                                                                                                                               | Decision                                                                                  |
| ---------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 2026-10-25 | `npm audit` with next@16.4.0                                                         | 1 vulnerable package, `next`: **critical** GHSA-2464-fhr4-w9xw (RCE, image optimizer + SVG), **critical** GHSA-673q-mjm6-r5xr (RCE, `use cache`), **high** GHSA-p3m5-59mp-jv5r (DoS, Server Actions) | Upgraded to next@16.4.1, the first patched version. Not suppressed                        |
| 2026-10-25 | `npm audit` (final tree)                                                             | `found 0 vulnerabilities`                                                                                                                                                                            | None needed                                                                               |
| 2026-10-25 | `npm audit --omit=dev`                                                               | `found 0 vulnerabilities`                                                                                                                                                                            | None needed                                                                               |
| 2026-10-25 | Node runtime review (CTO review)                                                     | Previous pin, Node 22.22.2, was missing security releases 22.23.0, 22.23.2 and 22.23.4                                                                                                               | Toolchain moved to Node 24.22.1 (security release, 7 CVEs). See ADR 001, Toolchain policy |
| 2026-10-25 | npm 11.9.0 behaviour test                                                            | npm 11.9.0 ignores `allowScripts` and ran the denied `unrs-resolver` postinstall                                                                                                                     | npm floor set to 11.19.1, the lowest tested version that honours the policy               |
| 2026-10-25 | `npm audit signatures`                                                               | **Not run.** The build sandbox blocked `tuf-repo-cdn.sigstore.dev` (ENOTFOUND)                                                                                                                       | Runs in CI; confirm on the first CI run                                                   |
| 2026-10-25 | Windows (Product Owner): `npm audit`, `npm audit --omit=dev`, `npm audit signatures` | 0 vulnerabilities in both audits; 428 packages with verified registry signatures, 111 with verified attestations (`docs/reports/evidence/4-windows-node24/12-windows-validation.log`)                | Signatures verified locally. CI confirmation still pending: GitHub Actions has not run    |

Install scripts: `unrs-resolver` (a transitive dev dependency) is explicitly denied
(`allowScripts` in `package.json`). Lint works without it.

Licenses (production dependencies): MIT, Apache-2.0, ISC, BSD-3-Clause, 0BSD,
CC-BY-4.0 (`caniuse-lite` data), and LGPL-3.0-or-later (`@img/sharp-libvips`, the
unmodified native image library bundled through Next.js's optional `sharp`). No legal
review has been done; check the LGPL item before distributing builds to others.

## Planned controls (not implemented)

**Authentication (admin dashboard).** A single owner account, with phishing-resistant
MFA (passkey or WebAuthn preferred, TOTP as fallback) required before any private data
exists. Use an established, maintained auth library rather than custom crypto; the
library choice is open. No public sign-up.

**Sessions.** Server-side sessions stored in PostgreSQL. Cookies set `HttpOnly`, `Secure`,
`SameSite=Lax`, with the `__Host-` prefix. Short idle timeout and absolute lifetime.
Session rotated on login. Logout invalidates the session on the server.

**Authorization.** Deny by default. Checks live in the module data-access layer (every
query checks the caller), not only in middleware or the UI. Admin routes live under the
`(internal)` route group.

**Tenant isolation (portals).** Every tenant-owned row carries `organization_id`. The
data-access layer requires a tenant context for every query, with PostgreSQL row-level
security as a second layer for evaluation. Automated cross-tenant access tests are
required before portals launch.

**Audit logging.** An append-only audit table recording sign-ins, failed sign-ins, data
exports, record changes and permission changes, with actor, time, action, target and
IP. Never log secrets or full personal data.

**Input handling.** Zod validation at every server boundary. Rate limiting and bot
protection on public forms. Nonce-based CSP once forms exist.

**Privacy.** Collect the minimum personal data. Publish a privacy notice before the
inquiry form goes live. Define retention and deletion. Never use real client data in
tests or fixtures. Do not paste client data into AI tools. The data-protection
obligations in Liberia and other target countries need review; not done.

**Runtime updates.** Track Node.js security releases and update `.nvmrc` (and therefore CI and deployment) promptly; security releases are exempt from the 14-day freshness rule.

**Operations.** HSTS and TLS at deployment, secret storage in the host's secret manager,
backups and restore tests, automated dependency update PRs, a secret-scanning step in
CI, and GitHub branch protection.
