# Roadmap

_Proposed sequence for Product Owner review. Task numbers after CRA-001 are proposals,
not approved tasks. The guiding order is: internal operations first, then a public
lead-capture path, then customer-facing capabilities, so that each step adds business
value while security controls are in place before the data they protect arrives._

## Done

- **CRA-001: Foundation (this task).** Static public pages, env validation, lint, type
  check, tests, CI, and security and architecture documentation.

## Phase 1: Internal operating system (owner only)

| Proposed task | Scope                                                                                                                                         | Key prerequisite |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **CRA-002**   | **Persistence foundation:** local PostgreSQL via Docker Compose, Prisma-or-Drizzle decision, migrations, test database, least-privilege roles | CRA-001          |
| CRA-003       | **Owner authentication:** admin sign-in with MFA, sessions, protected `(internal)` area, audit log table                                      | CRA-002          |
| CRA-004       | **Leads and organisations:** internal CRUD, notes and status pipeline                                                                         | CRA-003          |
| CRA-005       | **Hosting and deployment:** provider choice with cost review, HTTPS/HSTS, secrets management, backups, health checks                          | CRA-002          |

## Phase 2: Public lead capture

| Proposed task | Scope                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| CRA-006       | **Working inquiry form:** stores leads, spam and rate limiting, privacy notice, nonce-based CSP, Playwright end-to-end tests |
| CRA-007       | **Catalog management:** courses move from static data into the database and are edited from the dashboard                    |

## Phase 3: Delivery operations

- Engagements and delivery tracking (sessions, attendance, materials).
- Assessments and reports for client organisations.
- AI-assisted content and prompt workspace: stores prompts and drafts used **manually**
  with the existing ChatGPT and Claude subscriptions. There is no AI API integration
  until the budget and a data-handling review allow it.

## Phase 4: Customer-facing platform

- Organisation portal: multi-tenant, client admins see their own engagements and
  reports.
- Learner portal: enrolment, course access and assessment results.
- Email and WhatsApp notifications (provider and cost decision needed).
- Subscription services and billing (provider decision needed; payment options suited
  to Liberia, such as mobile money, need research).

## Deferred decisions

Hosting provider and budget; Prisma or Drizzle; authentication library; messaging
providers; payment provider; data-protection obligations; whether a full LMS is ever
built or an existing one is integrated.

## Ongoing practices to establish

Regular dependency updates (an automated update bot), GitHub branch protection,
secret scanning in CI, and periodic review of the threat model.
