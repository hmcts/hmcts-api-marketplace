# Capabilities — HMCTS API Catalogue

14 capabilities define the full scope of the platform. Each maps to a set of requirements and user stories.

---

## Summary

| ID | Capability | Priority | Phase |
|---|---|---|---|
| CAP-01 | API Catalogue & Discovery | Must Have | MVP |
| CAP-02 | User Registration & Identity Management | Must Have | MVP |
| CAP-03 | API Publication & Onboarding | Must Have | MVP |
| CAP-04 | API Publication Review & Approval | Must Have | MVP |
| CAP-05 | Access Request Management | Must Have | MVP |
| CAP-06 | Access Request Approval Workflow | Must Have | MVP |
| CAP-07 | Notifications & Communications | Must Have | MVP |
| CAP-08 | API Lifecycle Management | Should Have | MVP |
| CAP-09 | Consumer Access & Credential Management | Must Have | MVP |
| CAP-10 | Usage Monitoring & Analytics | Should Have | Phase 2 |
| CAP-11 | Developer & Business User Experience | Should Have | Phase 2 |
| CAP-12 | Governance, Compliance & Audit | Must Have | MVP |
| CAP-13 | Search & Data Discovery Intelligence | Should Have | Phase 2 |
| CAP-14 | Platform Administration | Must Have | MVP |

---

## CAP-01: API Catalogue & Discovery

The ability for any user to browse, search and discover APIs without requiring login.

**What it includes:**
- Browsable catalogue with search and domain filtering
- API cards showing name, version, domain, classification and auth type
- Detail pages with plain-English summary and full technical documentation
- Endpoints, data model, changelog and try-it-out tabs
- Live spec fetching from SwaggerHub with embedded fallback
- Zero-results state with new API suggestion prompt
- Related API suggestions in sidebar

**Primary users:** Consumer, Producer (browsing their own APIs)

---

## CAP-02: User Registration & Identity Management

The ability for users to register, sign in and manage their account with an appropriate role.

**What it includes:**
- Self-service registration with Consumer, Producer or Reviewer role selection
- Email and password sign in
- Session management and sign out
- Profile management (name, organisation)
- Role-based routing to appropriate dashboard
- Email verification (production — requires backend)
- Password reset (production — requires backend)

**Primary users:** Consumer, Producer, Reviewer

---

## CAP-03: API Publication & Onboarding

The ability for producers to submit APIs for listing in the catalogue.

**What it includes:**
- Three-step task list publication journey
- API identification (name, spec source)
- Three spec source options: SwaggerHub, URL, file upload
- Live spec validation on form fields
- Data classification (Official, Official-Sensitive, Restricted)
- Domain and authentication type fields
- Plain-English description with character counter and minimum length
- Check your answers before submission
- Three-declaration confirmation
- Draft save and restore
- Edit a submitted API
- Submission routed to shared review queue

**Primary users:** Producer

---

## CAP-04: API Publication Review & Approval

The ability for reviewers to assess API submissions against quality and governance standards.

**What it includes:**
- Review queue showing all pending submissions
- Full submission detail view
- Approve and publish action (API appears live in catalogue immediately)
- Reject with mandatory reason field
- Optional notes for the producer on approval
- Reviewed history panel
- Status visible to producer in My APIs
- Reviewer notes visible to producer

**Primary users:** Reviewer, Producer (receiving decision)

---

## CAP-05: Access Request Management

The ability for consumers to submit, track and manage requests to access existing APIs.

**What it includes:**
- Four-step task list access request journey
- API selection, environment, volume, system name and justification fields
- Check your answers before submission
- Two-declaration confirmation
- Request stored and visible to consumer in My Requests
- Status tracking (pending, approved, rejected)
- Request visible to API owner (requires backend for cross-user visibility)

**Primary users:** Consumer

---

## CAP-06: Access Request Approval Workflow

The ability for API owners (producers) to review and action incoming access requests.

**What it includes:**
- Incoming access requests visible in producer dashboard
- Request detail view with consumer justification and system information
- Approve with optional notes
- Reject with mandatory reason
- Status update propagated to consumer
- SLA enforcement and reminders (production — requires backend)
- Governance review stage for Official-Sensitive APIs

**Primary users:** Producer, Reviewer (governance stage)

---

## CAP-07: Notifications & Communications

The ability for users to be informed of relevant events without needing to check the portal.

**What it includes:**
- In-portal notification bell with unread count badge
- Notification on access request approved
- Notification on access request rejected (with reason)
- Notification on API submission approved
- Notification on API submission rejected (with notes)
- Email notifications (production — requires GOV.UK Notify or equivalent)

**Primary users:** Consumer (receiving), Producer (receiving and triggering)

---

## CAP-08: API Lifecycle Management

The ability to manage the publication state of an API through its lifecycle.

**What it includes:**
- Lifecycle states: Draft, In Review, Live, Deprecated, Retired
- Producer can set and update lifecycle state
- Deprecated banner on API detail page
- Filter by lifecycle state in catalogue
- Consumer notification of deprecation or retirement
- Lifecycle state visible on API cards

**Primary users:** Producer, Consumer (affected)

---

## CAP-09: Consumer Access & Credential Management

The ability for approved consumers to receive, view and manage their API credentials.

**What it includes:**
- Credential issuance on access request approval
- Secure credential display (shown once)
- Credential rotation
- Active subscriptions view per consumer
- Revoke access
- Credentials tied to real authentication system (production — requires backend)

**Primary users:** Consumer

---

## CAP-10: Usage Monitoring & Analytics

*(Deferred to Phase 2)*

The ability to understand how APIs are being used across the platform.

**What it includes:**
- Usage statistics per API (request volume, error rates)
- Consumer count per API
- Request volume charts over time
- Producer-visible analytics for their own APIs
- Platform-wide analytics for marketplace administrators

**Primary users:** Producer, Reviewer, Administrator

---

## CAP-11: Developer & Business User Experience

*(Deferred to Phase 2)*

Enhanced experiences for technical and non-technical users beyond the core journey.

**What it includes:**
- Sandbox environment for testing without credentials
- Data dictionary view for schema fields
- Onboarding walkthroughs and getting started guides
- Code examples in multiple languages
- Interactive API explorer (beyond mock server links)

**Primary users:** Consumer (developer and business analyst)

---

## CAP-12: Governance, Compliance & Audit

The ability to ensure all platform activity meets legal and organisational obligations.

**What it includes:**
- Data classification enforcement on all published APIs
- Audit trail of all submissions, approvals, rejections and access decisions
- GDPR and DSA tracking per API and per consumer
- Access log showing who has access to what and when it was granted
- Compliance checks during publication review
- Data retention policies

**Primary users:** Reviewer, Administrator

---

## CAP-13: Search & Data Discovery Intelligence

*(Deferred to Phase 2)*

Advanced search and discovery beyond keyword matching.

**What it includes:**
- Full-text search across endpoint descriptions and schema field names
- Business-language search mapping (e.g. "defendant address" maps to relevant APIs)
- Related API suggestions based on domain and search context
- "Did you mean" suggestions
- Trending and recently added sections
- AI-assisted discovery

**Primary users:** Consumer

---

## CAP-14: Platform Administration

The ability for marketplace administrators to configure, manage and govern the overall platform.

**What it includes:**
- User and role management
- Organisation and team management
- API taxonomy, domain and classification standard management
- Configurable approval workflows and SLA thresholds
- Platform health monitoring
- Platform-wide announcements

**Primary users:** Administrator

---

*Last updated: May 2026*
