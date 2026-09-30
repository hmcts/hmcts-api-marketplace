# Design documentation

Audit findings, design specifications and architecture decision records for the HMCTS API Marketplace
site.

These live outside `docs/` on purpose: `docs/` is the GitHub Pages publishing root, so anything placed
there is served from the public site. An audit that enumerates the service's weaknesses should not be
a page on the service.

## Contents

| Document | What it is |
|---|---|
| [`audit/2026-08-17-govuk-conformance-audit.md`](audit/2026-08-17-govuk-conformance-audit.md) | Conformance audit of the current 28-page site against the GOV.UK Design System, Service Standard, WCAG 2.2 AA and the accessibility, cookie and data-protection regulations. 5 Critical, 8 High, 7 Medium, 6 Low. Every count is reproducible. |
| [`specs/2026-08-17-govuk-conformant-site-design.md`](specs/2026-08-17-govuk-conformant-site-design.md) | Design for the GOV.UK-conformant rebuild: architecture, information architecture, page and journey inventory, component mapping, verification gates, sequencing. |
| [`slice-review/2026-08-17-phase-1-slice-review.md`](slice-review/2026-08-17-phase-1-slice-review.md) | **The Phase 1 approval gate.** What was built, the verbatim gate and mutation-test output, the journey driven in a browser, which audit findings are closed, and what building it proved the plan had wrong. |
| [`plans/2026-08-17-phase-1-vertical-slice.md`](plans/2026-08-17-phase-1-vertical-slice.md) | Task-by-task implementation plan for Phase 1 — Kit scaffold, mutation-tested export and gates, the three legal pages, and the five-page vertical slice that the approval gate is decided from. Dependency versions in it were verified against the real packages. |
| [`specs/2026-09-11-consumer-producer-detailed-design.md`](specs/2026-09-11-consumer-producer-detailed-design.md) | Detailed design against the product owner's consumer/producer MoSCoW requirements — maps each requirement to whichever of the three real systems owns it (this prototype, `hmcts-api-marketplace-auth`, or the hosted `apim-marketplace-web`), what's already built, and what's still blocked on an external data or workflow dependency. |

## Architecture decision records

| ADR | Status | Decision |
|---|---|---|
| [0001](adr/0001-govuk-branding-and-domain.md) | Accepted | Full GOV.UK branding, targeting a `service.gov.uk` domain — with the interim licence non-conformance recorded rather than hidden |
| [0002](adr/0002-prototype-kit-with-static-export.md) | Accepted | GOV.UK Prototype Kit, exported to static HTML for GitHub Pages, driven by an explicit route manifest |
| [0003](adr/0003-authentication-and-identity.md) | Accepted | No authentication backend — the unsanctioned `onrender.com` dependency is removed and the flows are faked client-side until a sanctioned identity solution exists |
| [0004](adr/0004-hosting-until-the-service-gov-uk-move.md) | Accepted for beta | Stay on GitHub Pages for now; move for the gov.uk destination, because Pages cannot set security response headers |
| [0005](adr/0005-in-repo-api-catalogue.md) | Accepted | Bring the API catalogue listing and detail pages back in-repo, reading live from amp-catalog rather than a checked-in dataset |

## Conventions

- One ADR per decision, numbered sequentially, never rewritten once Accepted — superseded by a later
  ADR instead.
- Every ADR records the options considered and the rationale, not just the outcome.
- Audit findings carry stable IDs (`D-1`, `A-1`, `L-2`, …) so the spec and the ADRs can cite them and
  the citations keep working.
