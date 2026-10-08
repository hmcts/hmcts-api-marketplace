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

## Prototypes

Two prototypes have been built, both hosted on GitHub Pages.

### MVP Prototype (no-auth, current)
**URL:** https://hmcts.github.io/hmcts-api-marketplace/
**File:** `docs/index.html` (295 KB)

A no-authentication single-page prototype focused on the consumer journey and service discovery. Built to be shown to stakeholders without requiring login.

| Feature | Status |
|---|---|
| API Marketplace homepage with 4 navigation cards | ✅ Built |
| API Catalogue with search, domain/status/classification filters, A-Z nav | ✅ Built |
| API detail pages — live spec fetch, 5 tabs, sidebar with version/status/response codes | ✅ Built |
| Request API access form with declarations and email submission | ✅ Built |
| Notify of new API form | ✅ Built |
| Publish an API form with GitHub spec URL preview | ✅ Built |
| Onboarding guide (consumer + producer step-by-step) | ✅ Built |
| Consumer guidance page | ✅ Built |
| Producer standards page | ✅ Built |
| Data governance page | ✅ Built |
| GOV.UK Frontend 5.4.0 styling and GDS Transport font | ✅ Built |
| Consistent footer (Support + Policies) across all pages | ✅ Built |
| 9 live HMCTS APIs in catalogue (fetching specs from GitHub) | ✅ Built |

### Full Prototype (auth + dashboards)
**URL:** https://hmcts.github.io/hmcts-api-marketplace/
**File:** `docs/index.html` and `prototype/api-catalogue-v7.html`

A fully featured prototype with authentication, role-based dashboards and the complete publication and approval workflow.

| Feature | Status |
|---|---|
| Browse and search 9 live HMCTS APIs | ✅ Built |
| Domain, status and classification filters, A-Z navigation | ✅ Built |
| Full API detail pages (5 tabs: Overview, Endpoints, Data model, Changelog, Try it out) | ✅ Built |
| Live spec fetch from GitHub with embedded YAML fallback | ✅ Built |
| GOV.UK Frontend 5.4.0 with GDS Transport font | ✅ Built |
| Consumer registration and sign in | ✅ Built |
| Consumer access request (4-step task list) | ✅ Built |
| Producer publish API (3-step task list, 3 spec sources) | ✅ Built |
| Publication review and approval (reviewer role) | ✅ Built |
| Consumer dashboard (requests, tracking) | ✅ Built |
| Producer dashboard (submissions, incoming requests) | ✅ Built |
| Reviewer dashboard (review queue, history) | ✅ Built |
| Suggest a new API flow | ✅ Built |
| Draft save and restore | ✅ Built |
| Approved APIs appear live in catalogue immediately | ✅ Built |
| Data governance standards page | ✅ Built |

---

## Running Locally

See [`RUNNING-LOCALLY.md`](RUNNING-LOCALLY.md) for what to install, how to run the prototype and gates, and optional configuration.

---

## Repository Structure

```
hmcts-api-marketplace/
│
├── README.md
├── prototype/
│   └── api-catalogue-v7.html          # Full prototype (auth + dashboards)
│
├── docs/
│   ├── index.html                     # Full prototype (GitHub Pages root)
│   ├── prototype-mvp/
│   │   └── index.html                 # MVP prototype (no-auth)
│   ├── product-vision.md
│   ├── capabilities.md                # 14 capability definitions
│   ├── roadmap.md                     # MVP and Phase 2 phasing
│   ├── requirements/                  # CAP-01 to CAP-14 requirement files
│   ├── user-journeys/                 # Consumer, producer, reviewer journeys
│   └── gap-analysis/                  # Capability and requirements status
│
└── prototype-mvp/
    └── index.html                     # MVP prototype (mirror)
```

---

## Capabilities

14 capabilities define the full platform scope. See [`docs/capabilities.md`](docs/v0/capabilities.md) for full detail.

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

- Single HTML file — no framework, no build pipeline
- [GOV.UK Frontend 5.4.0](https://frontend.design-system.service.gov.uk) via CDN
- GDS Transport font via jsDelivr CDN
- Live API spec fetching from GitHub (`raw.githubusercontent.com`)
- MVP: email-based form submission via `mailto:` (no backend required)
- Full prototype: localStorage for data persistence

---

## Contact

HMCTS API Marketplace team: [Nagashankar.Ponnaganti@HMCTS.NET](mailto:Nagashankar.Ponnaganti@HMCTS.NET)

---

## Licence

MIT — HMCTS Digital and Technology Solutions.

