# CRA-001 evidence index

Sections 1-3 were captured by the developer in a Linux sandbox. Every file there is a raw
capture of real command output unless its name starts with `NOT-RAW`. Raw files were
written by redirecting the command's own stdout/stderr to the file; they have not been
edited. Each file's first line records when it was captured and the Node and npm
versions used.

Section 4 is a transcript captured **by the Product Owner on Windows**. It was not produced by the
developer, and the developer has not inspected it: it was not available in the
environment where this index was updated. The results listed for it are the CTO's
summary.

## Why this folder was missing from the first delivery

`.gitignore` contained `*.log`, and the ZIP was built from the non-ignored file set, so
every `.log` here was silently excluded. The ZIP was not checked against the report's
claims before delivery. Fixed by a `.gitignore` exception for `docs/reports/evidence/`.

## 1-original-run-node22/ (original CRA-001 run, Node 22.22.2 / npm 11.21.0)

| File                                                 | Provenance                                                                                                                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CRA-001-ci-run.log`                                 | **Raw.** Clean-copy run of npm ci, format, lint, type check, tests, build, both audits, signatures, smoke test and headers                                                                                                                    |
| `CRA-001-zip-verification-check.log`                 | **Raw.** `npm run check` on the unzipped deliverable                                                                                                                                                                                          |
| `CRA-001-startup-missing-site-url-server-output.log` | **Raw.** Server output only. The request result and exit code were never saved                                                                                                                                                                |
| `NOT-RAW-hand-written-startup-failure-summary.log`   | **Not raw.** Typed by hand from terminal output and delivered as if it were a log. **Contains an incorrect claim** ("connection refused"); see below. Superseded by `2-rerun-delivered-zip-node22/07*.log` and `3-remediation-node24/07*.log` |
| `NOT-RAW-hand-written-actionlint-summary.log`        | **Not raw.** Hand-written summary. Superseded by `2-rerun-delivered-zip-node22/08-actionlint.log`                                                                                                                                             |

**Correction.** The original report said that with `SITE_URL` missing, requests get
"connection refused". That was a test-design error: the request was made only after
`timeout` had already killed the server. The rerun sends requests while the server is
running and shows that it answers **HTTP 500 "Internal Server Error"**, with no
configuration details in the body and security headers still sent. The process keeps
running.

## 2-rerun-delivered-zip-node22/ (rerun 2026-10-25 on the delivered ZIP, unchanged)

Same toolchain as the original run (Node 22.22.2 / npm 11.21.0). `01`-`08` cover npm ci;
format, lint, type check and tests; the build with `SITE_URL` unset (expected exit 1);
the production build; both audits plus signatures (exit 1: sandbox DNS); the smoke test
and headers; the startup failure; and actionlint. `07b` captures the HTTP 500 response
bodies.

## 3-remediation-node24/ (proposed remediation patch applied)

| File                                         | What it shows                                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `00-cto-toolchain-reproduction.log`          | Node 24.14.0 / npm 11.9.0: delivered ZIP fails `EBADENGINE`; patched tree also fails, with the clearer `Required: ^24.15.0`        |
| `00b-node22-rejected.log`                    | Node 22.22.2 / npm 11.21.0 is rejected by the patched engines (single-LTS policy)                                                  |
| `01-npm-ci.log`, `01b-postinstall-check.log` | Node 24.22.1 / npm 11.19.1: clean install; denied postinstall did not run                                                          |
| `02`-`05`                                    | Format, lint, type check, 16 tests, build (unset and set), audits, signatures (exit 1: sandbox DNS)                                |
| `06`, `07`                                   | Smoke test and headers; startup failure: process running, HTTP 500, no leak                                                        |
| `08-actionlint.log`                          | Patched workflow: 0 errors (shellcheck unavailable)                                                                                |
| `09-npm-version-matrix.log`                  | npm 11.9.0 runs the denied postinstall; 11.19.1 and 11.21.0 honour `allowScripts`                                                  |
| `10-lockfile-delta.log`                      | Only the lockfile's root `engines` block changed                                                                                   |
| `11-final-recheck.log`                       | Final tree after all doc edits: npm ci, `npm run check` (format, lint, type check, 16 tests, build), actionlint, audit; all exit 0 |

## 4-windows-node24/ (Product Owner validation on Windows, 2026-10-25)

| File                                                                                                                        | Environment                                        | What it shows (Product Owner's summary)                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `4-windows-node24/12-windows-validation.log` (full path `docs/reports/evidence/4-windows-node24/12-windows-validation.log`) | Windows; Node.js v24.22.1; npm 11.19.1; 2026-10-25 | `npm run check` passed (Prettier, ESLint, TypeScript, 16/16 tests across 3 files, production build with `/`, `/_not-found`, `/contact`, `/services`); `npm audit` and `npm audit --omit=dev`: 0 vulnerabilities; `npm audit signatures`: 428 packages with verified registry signatures, 111 with verified attestations |

Note on the count: Linux installs added 429 packages, Windows verified 428. The lockfile
explains this: on Linux x64, `sharp` uses two platform packages (`@img/sharp-linux-x64`
and `@img/sharp-libvips-linux-x64`); on Windows x64 it uses one (`@img/sharp-win32-x64`).
Whether the transcript lists any missing or invalid signatures has not been checked by
the developer.

## Environment limits

- Sections 1-3: Linux sandbox only. Node 24 binaries came from the npm registry's
  `node-linux-x64` packages, and npm versions from the `npm` package. `npm audit
signatures` could not reach `tuf-repo-cdn.sigstore.dev` (DNS blocked).
- Section 4: Windows, run by the Product Owner. `npm audit signatures` completed there. The
  transcript's summary does not cover the Windows install step, `npm start` or an HTTP
  smoke test.
- All sections: no real-browser review; no GitHub Actions run; no deployment.
