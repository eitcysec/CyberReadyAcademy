# Threat model

_Scope: the system as it exists after CRA-001, plus threats that the next tasks must
design for. This is a lightweight STRIDE-style review by the developer, **not** an
independent security assessment._

## System today

A Next.js server that serves four static pages. It has no user input, no forms, no API
routes, no Server Actions, no database, no authentication, no third-party scripts or
fonts, no outbound calls and no deployment.

## Assets

| Asset                                  | Exists now | Why it matters                                                            |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Source code and Git history            | yes        | Tampering could ship malicious code to visitors                           |
| CI pipeline and GitHub token           | yes        | Could be abused to alter the repository or the build                      |
| Dependency supply chain                | yes        | Malicious or vulnerable packages run in build and at runtime              |
| Brand reputation (public site content) | yes        | Defacement or false claims are especially damaging for a security trainer |
| Configuration and future secrets       | partly     | Only `SITE_URL` today; database and auth secrets later                    |
| Lead and client data                   | planned    | Personal data of prospects, client organisations and learners             |
| Assessment results and reports         | planned    | Sensitive information about client weaknesses                             |
| Owner's admin account                  | planned    | Full control of the business system                                       |

## Trust boundaries

1. **Internet → Next.js server.** Today it accepts only `GET` requests for static pages.
2. **Developer machine → GitHub repository.** Commits and pushes.
3. **Pull request → CI runner.** Untrusted code runs here when PRs come from forks.
4. **npm registry → build.** Third-party code enters through dependencies.
5. **Environment → application.** Configuration values cross into the app at startup.
6. **(Planned) App → PostgreSQL**, **App → email/WhatsApp providers**, and
   **Owner → AI tools** (manual copy and paste of content).

## Threats and mitigations

| #   | Threat (STRIDE)                                                            | Mitigation in CRA-001                                                                                                                                                               | Residual risk                                                                                                      |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| T1  | Malicious or vulnerable dependency (Tampering, Elevation)                  | Lockfile with exact versions; 14-day freshness rule; `npm audit` and `npm audit signatures` in CI; install scripts blocked by default                                               | Zero-day compromises and unreported vulnerabilities; signatures verified on Windows (2026-10-25) but not yet in CI |
| T2  | Known framework vulnerability exploited (Elevation)                        | Next 16.4.0 rejected for critical RCE advisories; 16.4.1 used; audit fails CI on any finding                                                                                        | New advisories appear after merge; no automated update bot yet                                                     |
| T3  | Secret committed to the repository (Information disclosure)                | `.env*` git-ignored except the example; example holds placeholders only; no secrets exist                                                                                           | No secret scanner in CI yet; human error remains possible                                                          |
| T4  | Secrets leaked through error messages or logs (Information disclosure)     | Env validation reports names, never values (unit-tested)                                                                                                                            | Future code could log carelessly; needs code review                                                                |
| T5  | Malicious pull request steals CI secrets or writes to the repo (Elevation) | `pull_request` trigger only; read-only token; `persist-credentials: false`; no secrets in workflow; actions pinned by SHA                                                           | GitHub-side configuration (branch protection, fork approval) must still be set by the owner                        |
| T6  | Clickjacking, MIME sniffing, injected content (Tampering)                  | CSP with `frame-ancestors 'none'` and `object-src 'none'`; `X-Frame-Options: DENY`; `nosniff`; `react/no-danger` and `no-eval` lint rules                                           | CSP permits `'unsafe-inline'` scripts and styles (see baseline)                                                    |
| T7  | Site misrepresents services (reputation, regulatory)                       | Every course is labelled "planned"; contact page states that nothing can be submitted; covered by tests                                                                             | Copy needs owner review before public launch                                                                       |
| T8  | Misconfigured deployment serves broken or unsafe pages (Availability)      | Startup and build fail on invalid configuration; a server with invalid configuration answers every request with a generic HTTP 500 (verified: no configuration details in the body) | The process stays running and returns 500 rather than exiting, so a deployment needs a health check                |
| T9  | Denial of service (Availability)                                           | Static pages only; no expensive endpoints; image optimizer limited to local images                                                                                                  | No rate limiting or CDN yet; depends on future hosting                                                             |

## Threats for planned features (must be addressed in their tasks)

- **Inquiry form:** spam, bots, injection, abuse of notification channels, and personal
  data stored without a privacy notice.
- **Admin dashboard:** credential stuffing, phishing of the owner (the most likely real
  attack), session theft, CSRF and missing authorization checks.
- **Client portals:** cross-tenant data access (IDOR) and over-broad roles.
- **AI workspace:** client data pasted into third-party AI tools, and prompt injection
  through imported content.
- **Messaging:** sender spoofing and leaked provider API keys.

## Review triggers

Update this document when any of these are added: user input, persistence,
authentication, a new external service, or a deployment.
