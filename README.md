# CyberReady Academy

Application foundation for CyberReady Academy: a public website for a cybersecurity
awareness training business in Liberia, growing over time into an internal operating
system and customer-facing training platform.

**Status:** CRA-001 foundation. The public pages are placeholders. Nothing can be booked or
submitted, there is no database, no authentication and no deployment. See
[docs/roadmap.md](docs/roadmap.md).

## Quick start

Requires Node.js 22 (22.12 or newer) and npm 11.21.0 or newer.

```bash
npm install -g npm@11.21.0      # once, if `npm --version` is older than 11.21.0
npm ci                          # install exactly what package-lock.json specifies
cp .env.example .env.local      # placeholder values only; no secrets needed
npm run dev                     # http://localhost:3000
```

## Commands

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Development server with hot reload                      |
| `npm run build`        | Production build (needs `SITE_URL`, see `.env.example`) |
| `npm start`            | Serve the production build                              |
| `npm run lint`         | ESLint, zero warnings allowed                           |
| `npm run typecheck`    | TypeScript type check                                   |
| `npm test`             | Unit and component tests (Vitest)                       |
| `npm run format:check` | Prettier formatting check                               |
| `npm run audit`        | Dependency vulnerability audit                          |
| `npm run check`        | Format check, lint, type check, tests and build in turn |

## Documentation

- [Development setup](docs/development-setup.md)
- [Architecture](docs/architecture.md) and [ADR 001](docs/adr/001-initial-architecture.md)
- [Threat model](docs/security/threat-model.md) and [security baseline](docs/security/security-baseline.md)
- [Roadmap](docs/roadmap.md)
- [CRA-001 implementation report](docs/reports/CRA-001-report.md)
