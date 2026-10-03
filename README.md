# HMCTS API Marketplace 

> **"We don't build APIs — we connect you to them."**
>
> *Like a library — we don't write the books, we organise them so you can find and borrow what you need.*

---

## What is the HMCTS API Marketplace?

The HMCTS API Marketplace is a **discovery, publication and access management platform** for APIs across HMCTS Digital and Technology Solutions. It is the central directory for all available APIs — one place to browse what exists, understand how it works, and request access.

It is **not** a development team. The marketplace does not own, build or run any of the APIs it lists. Their respective teams do. The marketplace makes them **discoverable, documented and accessible**.

---

## What It Does and Doesn't Do

| ✅ The API Marketplace does | ❌ The API Marketplace does not |
|---|---|
| Catalogue and curate APIs across the programme | Build, own or develop APIs |
| Provide a single point of discovery | Host data or run backend services |
| Document what each API does in plain English | Support the API — that stays with the owner |
| Manage access requests and the approval workflow | Make architectural decisions for API teams |
| Enforce naming conventions and data classification standards | Guarantee uptime or SLAs for listed APIs |
| Connect API owners with the consumers who need their data | Act as a development team for hire |
| Capture demand signals when consumers need data that isn't available | Replace any team's responsibility for their APIs |

---

## Who It's For

### API Consumers
Teams and developers who need to use an existing API rather than build one from scratch. Browse, discover, read documentation and request access — all in one place.

### API Producers
Teams that build and own APIs and want them discoverable and usable by others. List your API, manage access, and respond to consumer requests.

### Reviewers
Marketplace team members responsible for governance and standards. Review API submissions, triage access requests, and manage the catalogue.

---

## The site

**URL:** https://hmcts.github.io/hmcts-api-marketplace/

The site is authored in the [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk) under
`prototype-kit/` and exported as static HTML into `docs/`, which GitHub Pages serves. It uses real
GOV.UK Frontend, is bilingual (English and Welsh), and covers 46 routes.

| Feature | Status |
|---|---|
| Homepage, get-started and guidance pages | ✅ Built |
| API catalogue reading live from `amp-catalog`, with per-API detail pages | ✅ Built |
| Request API access journey | ✅ Built |
| Request a new API journey | ✅ Built |
| Publish an API journey | ✅ Built |
| Sign in, register and account pages | ✅ Built |
| My applications, API keys and team members | ✅ Built |
| Accessibility statement, cookies and privacy pages | ✅ Built |
| Welsh translation of navigation and page furniture | ✅ Built |
| Welsh translation of page copy | ⚪ Awaiting the HMCTS Welsh Language Unit |

Quality is enforced by seven gates on every pull request — manifest reconciliation, translations, page
structure, markup validity, link integrity, accessibility (axe, WCAG 2.1 AA) and reflow to 320px —
each proven by a mutation test that breaks the thing it checks and asserts the gate fails.

### Superseded generations

Two earlier generations are kept for reference in `archive/`, outside the publishing root. Their
content is immutable: a CI step compares file hashes and fails any pull request that changes them.

| | Location | What it was |
|---|---|---|
| **v1** | `archive/v1` | 28 hand-written pages with a bespoke 37 KB stylesheet and no GOV.UK Frontend. Was the live site until September 2026. |
| **v0** | `archive/v0` | A single-file vanilla-JS prototype with three role dashboards. Root-level copies survive as `index.html` and `prototype/`. |

---

## Repository Structure

```
hmcts-api-marketplace/
│
├── prototype-kit/                  # where pages are authored (edit here)
│   └── app/
│       ├── views/                  # Nunjucks pages, GOV.UK macros
│       ├── routes.js               # routes, locales, template-wide values
│       ├── locales/{en,cy}.json    # English and Welsh strings
│       └── assets/javascripts/
│
├── docs/                           # GENERATED static export - never hand-edit
│                                   # this is the GitHub Pages publishing root
│
├── scripts/                        # export and the seven conformance gates
│   ├── export-static.mjs
│   ├── routes.manifest.json        # every route, declared explicitly
│   ├── redirects.json              # old URLs -> new locations
│   ├── check-*.mjs                 # the gates
│   └── verify-gates.mjs            # mutation tests proving the gates bite
│
├── design/                         # audit, specs, ADRs, flow diagrams
│   ├── adr/                        # 0001-0005
│   ├── audit/
│   └── specs/
│
└── archive/                        # superseded generations, immutable
    ├── v0/                         # original prototype + capability specs
    └── v1/                         # bespoke 28-page site
```

---

## Capabilities

14 capabilities define the full platform scope. See [`archive/v0/capabilities.md`](archive/v0/capabilities.md) for full detail.

| ID | Capability | Priority | Phase | v7 Status | MVP Status |
|---|---|---|---|---|---|
| CAP-01 | API Catalogue & Discovery | Must Have | MVP | 92% | ✅ Core built |
| CAP-02 | User Registration & Identity | Must Have | MVP | 62% | ⚪ No-auth by design |
| CAP-03 | API Publication & Onboarding | Must Have | MVP | 100% | ✅ Simplified form |
| CAP-04 | API Publication Review & Approval | Must Have | MVP | 100% | ⚪ Not in scope |
| CAP-05 | Access Request Management | Must Have | MVP | 100% | ✅ Form + email |
| CAP-06 | Access Request Approval Workflow | Must Have | MVP | 50% | ⚪ Not in scope |
| CAP-07 | Notifications & Communications | Must Have | MVP | 0% | ⚪ Email-based |
| CAP-08 | API Lifecycle Management | Should Have | MVP | 0% | ⚪ Not in scope |
| CAP-09 | Consumer Credential Management | Must Have | MVP | 0% | ⚪ Not in scope |
| CAP-10 | Usage Monitoring & Analytics | Should Have | Phase 2 | 0% | ⚪ Deferred |
| CAP-11 | Developer & Business UX | Should Have | Phase 2 | 50% | ✅ Guidance pages |
| CAP-12 | Governance, Compliance & Audit | Must Have | MVP | 25% | ✅ Data governance page |
| CAP-13 | Search & Discovery Intelligence | Should Have | Phase 2 | 0% | ⚪ Deferred |
| CAP-14 | Platform Administration | Must Have | MVP | 0% | ⚪ Not in scope |

---

## Technology

- [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk) with
  [GOV.UK Frontend 6.x](https://frontend.design-system.service.gov.uk), authored in Nunjucks
- Static export to `docs/`, served by GitHub Pages — no server at runtime
- Node 20–24 (`.nvmrc` pins 24, which CI uses)
- Bilingual by design: one set of templates, strings in `app/locales/{en,cy}.json`
- Live catalogue and OpenAPI specs fetched from `hmcts.github.io/amp-catalog` and
  `raw.githubusercontent.com`
- Multi-step journeys carry answers in `sessionStorage`; the static export has no server sessions
- Sign-in, account and the request forms call an auth API on `onrender.com` — an unsanctioned host,
  recorded as an explicit exception in [ADR 0003](design/adr/0003-authentication-and-identity.md)

---

## Contact

HMCTS API Marketplace team: [Nagashankar.Ponnaganti@HMCTS.NET](mailto:Nagashankar.Ponnaganti@HMCTS.NET)

---

## Licence

MIT — HMCTS Digital and Technology Solutions.

