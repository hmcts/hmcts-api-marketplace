# Product Vision — HMCTS API Catalogue

> **"We don't build APIs — we connect you to them."**

---

## What is the HMCTS API Catalogue?

The HMCTS API Catalogue is a curated discovery, publication and access management platform for APIs across the HMCTS Digital and Technology Solutions. Think of it as the central directory for all available APIs — one place to browse what exists, understand how it works, and request access.

The catalogue does not own, build or run any of the APIs it lists. Their respective teams do. The catalogue makes them **discoverable, documented and accessible**.

---

## Vision statement

To be the single authoritative source of truth for all HMCTS HMCTS APIs — enabling any team to find the data they need in minutes, not days, and giving API owners a governed, visible channel to share their work with the wider organisation.

---

## What the marketplace does

- Catalogues and curates APIs across the HMCTS Digital and Technology Solutions
- Provides a single point of discovery for consumers and producers
- Documents what each API does in plain English and technical detail
- Manages access requests and the approval workflow
- Enforces API naming conventions, documentation standards and data classification
- Connects API owners with the consumers who need their data
- Provides visibility to leadership of all APIs — what exists, who owns them, and how widely they are used
- Captures demand signals when consumers need data that isn't yet available

---

## What the marketplace does NOT do

- Build, own or develop APIs — that stays with each product team
- Host data or run backend services
- Support the API itself — support stays with the API owner
- Make architectural decisions for API teams
- Guarantee uptime or SLAs for listed APIs
- Replace any team's responsibility for maintaining their APIs
- Act as a development team for hire

---

## Who it is for

### API Consumers

Teams and developers who need to use an existing API rather than build one from scratch.

Consumers use the catalogue to:
- Browse and search for APIs that meet their use case
- Read plain-English summaries and technical documentation
- Try the mock server before requesting production access
- Submit a formal access request with a business justification
- Track the status of their requests
- Suggest new APIs when the data they need doesn't yet exist

### API Producers

Teams that build and own APIs and want them discoverable and usable by others.

Producers use the catalogue to:
- List their API with a specification and documentation
- Manage who can access their API
- Review and respond to consumer access requests
- Keep their spec up to date via SwaggerHub, a URL or file upload
- Understand who is consuming their API

### Reviewers

Marketplace team members responsible for governance, quality and standards.

Reviewers use the catalogue to:
- Review API submissions against quality and governance standards
- Approve or reject submissions with documented reasoning
- Review API suggestions from consumers as demand signals
- Ensure all published APIs meet data classification requirements

---

## Why this matters

### Stops duplication
Teams can check whether an API already exists before building a new one. The catalogue makes invisible work visible.

### Faster integration
Consumers get documentation, specs, mock servers and access requests in one place. Integration time reduces from weeks to days.

### Governance and standards
The approval workflow ensures only APIs that meet documentation and classification standards appear in the catalogue.

### Controlled access
Access requests with formal justifications mean sensitive data is only shared with authorised teams who have stated their use case.

### Visibility
Leadership and programme management get a clear, always-current picture of the API landscape — what exists, who owns it, and what consumer demand looks like.

---

## Design principles

1. **Open by default** — the catalogue is browsable without login. Authentication is only required when genuinely necessary.
2. **GDS-aligned** — built on GOV.UK Frontend, following GDS design principles and WCAG 2.1 AA accessibility.
3. **One thing per page** — transactional journeys (publish, request access) follow the GDS task list pattern.
4. **Plain English first** — every API has a non-technical summary alongside technical documentation.
5. **Honest about limitations** — the catalogue is clear about what it does and doesn't do, both in the UI and in conversations with stakeholders.

---

## Common misconceptions

| Misconception | Reality |
|---|---|
| "The marketplace team builds the APIs" | We list them. Your team builds and owns the API. |
| "If it's in the catalogue, the marketplace team supports it" | Support stays with the API owner. |
| "It's only for developers" | Product managers, architects and delivery managers should use it too. |
| "Listing my API means giving up ownership" | You remain the owner. Listing makes your API discoverable. |
| "The marketplace hosts our data" | We host documentation and metadata, not data or services. |

---

## Programme context

The HMCTS API Catalogue is part of the HMCTS Digital and Technology Solutions, delivered by HMCTS Digital and Technology Solutions. It sits alongside the API gateway and SwaggerHub organisation as part of the broader API management capability.

The prototype was built using the GOV.UK Design System and is designed to be deployable as a static web application on Azure Static Web Apps or GitHub Pages, with Supabase as the recommended shared backend when moving from prototype to production.

---

*Last updated: May 2026*
