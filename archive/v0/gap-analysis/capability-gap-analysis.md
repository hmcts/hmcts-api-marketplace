# Capability Gap Analysis

**Updated:** June 2026
**Scope:** Both prototypes — api-catalogue-v7 (full) and prototype-mvp (no-auth)

---

## Summary

| Capability | v7 Full Prototype | MVP Prototype | Notes |
|---|---|---|---|
| CAP-01 API Catalogue & Discovery | 92% | ✅ Core built | MVP: search, filter, detail pages, live spec |
| CAP-02 User Registration & Identity | 62% | ⚪ By design | MVP is no-auth — not a gap |
| CAP-03 API Publication & Onboarding | 100% | ✅ Simplified | MVP: single-form publish with email submission |
| CAP-04 Publication Review & Approval | 100% | ⚪ Not in scope | MVP routes submissions by email |
| CAP-05 Access Request Management | 100% | ✅ Form built | MVP: form with declarations, email submission |
| CAP-06 Access Request Approval Workflow | 50% | ⚪ Not in scope | MVP routes by email |
| CAP-07 Notifications & Communications | 0% | ⚪ Email-based | MVP uses mailto: for all submissions |
| CAP-08 API Lifecycle Management | 0% | ⚪ Not in scope | Deferred to production |
| CAP-09 Consumer Credential Management | 0% | ⚪ Not in scope | Deferred to production |
| CAP-10 Usage Monitoring & Analytics | Deferred | Deferred | Phase 2 |
| CAP-11 Developer & Business UX | 50% | ✅ Guidance built | MVP: onboarding, consumer guidance, producer standards |
| CAP-12 Governance, Compliance & Audit | 25% | ✅ Page built | MVP: full data governance standards page |
| CAP-13 Search & Discovery Intelligence | Deferred | Deferred | Phase 2 |
| CAP-14 Platform Administration | 0% | ⚪ Not in scope | Deferred to production |

---

## CAP-01 — API Catalogue & Discovery

### v7 Full Prototype — 92%

**What's built:** Browse, search, domain/status/classification filters, A-Z navigation, API cards, detail pages with 5 tabs (Overview, Endpoints, Data model, Changelog, Try it out), live spec fetching from GitHub with embedded YAML fallback, plain-English summaries, zero-results prompt, approved APIs merged into catalogue.

**What's missing:**
- Related APIs in sidebar (REQ-CAP01-08)

### MVP Prototype — Core built

**What's built:** Searchable API catalogue with domain/status/classification filters and A-Z navigation, API cards with status pills and tags, detail pages loading live OpenAPI specs from GitHub, API information sidebar (version, status, OpenAPI version, endpoint count), response codes from live spec, sync status bar, 5-tab detail page, Authentication card, Links section with text links.

**Differences from v7:** No embedded YAML fallback (live fetch only), no zero-results prompt, no spec source selection.

---

## CAP-02 — User Registration & Identity

### v7 Full Prototype — 62%

**What's built:** Register with role selection, permission-based auth model, sign in, sign out, profile management, localStorage session, role-based dashboard routing.

**What's missing:** Email verification, password reset, cross-device session persistence (all require backend).

### MVP Prototype — Not applicable

The MVP is a no-auth prototype by design. All form submissions route via `mailto:` to the marketplace team. This is appropriate for alpha/stakeholder demonstration purposes.

---

## CAP-03 — API Publication & Onboarding

### v7 Full Prototype — 100%

Full 3-step task list publication journey, three spec source options (SwaggerHub, URL, file upload), live spec validation, data classification, domain, auth type, plain-English description with character counter, check your answers, 3 declarations, draft save/restore, edit submitted API, submission to shared review queue.

### MVP Prototype — Simplified

Single-page Publish API form covering: API name, GitHub repository URL with live spec URL preview, version, domain, data classification, plain-English description, 4 declaration checkboxes, email submission. Sufficient for alpha stakeholder testing.

---

## CAP-05 — Access Request Management

### v7 Full Prototype — 100%

4-step task list, API selection, environment, volume, system name, business justification, check your answers, 2 declaration checkboxes, request stored in localStorage, consumer status tracking, request visible to API owner.

### MVP Prototype — Form built

Single-page form covering: API dropdown (live from catalogue), environment, call volume, use case/justification, OAuth capability radio, Full name, Organisation, Work email, Job title, Phone (optional), 4 declaration checkboxes, email submission via mailto:.

---

## CAP-11 — Developer & Business UX

### v7 Full Prototype — 50%

Consumer guidance and producer standards pages built. Onboarding guide, data governance, and walkthrough content not fully built.

### MVP Prototype — Guidance pages built

Full set of guidance pages:
- **Onboarding guide** — 6 sections, plain-English, consumer and producer step-by-step walkthroughs, sticky contents navigation
- **Consumer guidance** — 6 sections covering responsible use, authentication, data handling
- **Producer standards** — OpenAPI requirements, GitHub workflow, naming conventions
- **Data governance** — GDPR, DPIA, data classification, audit obligations

---

## CAP-12 — Governance, Compliance & Audit

### v7 Full Prototype — 25%

Data classification enforced on API cards and publication form. Full audit log and data retention automation not built.

### MVP Prototype — Page built

Full Data Governance Standards page covering: data classification (Official vs Official-Sensitive), GDPR obligations, DPIA requirements, data minimisation, audit and access logging, incident response, data retention. Linked from footer across all pages.

---

## Outstanding gaps (both prototypes)

| Gap | Affected capability | Effort to close |
|---|---|---|
| Related APIs in sidebar | CAP-01 | Low — no backend needed |
| Email verification and password reset | CAP-02 | Requires Supabase auth |
| Notifications (in-portal and email) | CAP-07 | Requires backend |
| API lifecycle automation (deprecation alerts) | CAP-08 | Requires backend |
| Credential management | CAP-09 | Requires backend |
| Governance stage for Official-Sensitive requests | CAP-06 | Medium effort |
| Platform administration | CAP-14 | Requires backend |
