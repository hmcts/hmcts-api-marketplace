# Roadmap — HMCTS API Catalogue

---

## Phasing

### MVP (Prototype → Production)

The MVP covers 11 of 14 capabilities and 66 of 94 user stories. It represents the minimum set of capabilities needed to operate the marketplace in production — users can register, producers can publish, reviewers can approve, and consumers can request and track access.

| Capability | MVP Stories | Notes |
|---|---|---|
| CAP-01 API Catalogue & Discovery | 6 of 8 | Related APIs sidebar and full-text schema search deferred |
| CAP-02 User Registration & Identity | 7 of 7 | Email verification and password reset require backend |
| CAP-03 API Publication & Onboarding | 7 of 7 | All stories included |
| CAP-04 Publication Review & Approval | 8 of 8 | All stories included |
| CAP-05 Access Request Management | 6 of 7 | Consumer resubmit after rejection deferred |
| CAP-06 Access Request Approval Workflow | 8 of 8 | All stories included |
| CAP-07 Notifications & Communications | 5 of 7 | Slack/Teams integration and SLA reminders deferred |
| CAP-08 API Lifecycle Management | 4 of 6 | Automated deprecation notifications deferred |
| CAP-09 Credential Management | 5 of 6 | Self-service credential rotation deferred |
| CAP-12 Governance, Compliance & Audit | 6 of 7 | Data retention automation deferred |
| CAP-14 Platform Administration | 4 of 6 | Platform announcements and usage reporting deferred |
| **Total** | **66 of 94** | |

### Phase 2

Three capabilities are fully deferred to Phase 2 as they enhance rather than enable the core marketplace:

| Capability | Reason for deferral |
|---|---|
| CAP-10 Usage Monitoring & Analytics | Valuable but not needed to operate the marketplace on day one. Requires API gateway instrumentation. |
| CAP-11 Developer & Business UX | Sandbox, data dictionary and walkthroughs are enhancements to a working catalogue. |
| CAP-13 Search & Discovery Intelligence | Basic keyword search covers MVP. Advanced search is a significant engineering investment. |

---

## Infrastructure dependency

The single biggest blocker between prototype and production is **a shared backend**. The prototype uses localStorage, which means:

- Each browser has its own isolated data store
- Submissions by one user are not visible to another
- Sessions do not persist across devices

**Recommended next step:** Connect [Supabase](https://supabase.com) as the backend. One Supabase project with four tables (`users`, `api_submissions`, `access_requests`, `api_suggestions`) unblocks CAP-02, CAP-04, CAP-05, CAP-06, CAP-07 and CAP-09 simultaneously.

### Supabase tables

| Table | Purpose |
|---|---|
| `profiles` | User accounts with role (consumer/producer/reviewer) |
| `api_submissions` | APIs submitted by producers for review |
| `access_requests` | Consumer requests to access an API |
| `api_suggestions` | Consumer suggestions for new APIs |
| `approved_apis` | APIs approved and live in the catalogue |
| `notifications` | In-portal notifications per user |

---

## Sprint plan (post-Supabase)

### Sprint 1 — Connect Supabase
- Replace localStorage auth with Supabase auth (email + password)
- Email verification on registration
- Sessions persist across devices and browsers
- **Delivers:** CAP-02 complete

### Sprint 2 — Shared submission and request stores
- API submissions write to `api_submissions` table
- Access requests write to `access_requests` table
- Reviewer sees all pending submissions from all producers
- Producer sees all access requests for their APIs
- **Delivers:** CAP-04 complete, CAP-05 complete, CAP-06 partial

### Sprint 3 — Approval workflow completion
- Producer approve/reject access requests
- Status updates propagated to consumer
- In-portal notification bell
- **Delivers:** CAP-06 complete, CAP-07 partial

### Sprint 4 — Lifecycle management
- API lifecycle states (Draft, Live, Deprecated, Retired)
- Producer can update lifecycle state
- Deprecated banner on detail pages
- Filter by lifecycle state
- **Delivers:** CAP-08 complete

### Sprint 5 — Credentials and governance
- Credential issuance on access request approval
- Audit trail writing to database
- Data classification enforcement
- **Delivers:** CAP-09 complete, CAP-12 complete

---

## Deployment target

| Environment | Platform | Use |
|---|---|---|
| Prototype | GitHub Pages / Netlify | Stakeholder demos, user research |
| Alpha | Azure Static Web Apps + Supabase | Real users, shared data |
| Beta | Azure Static Web Apps + Supabase + Azure AD | HMCTS SSO, production-grade auth |
| Live | Azure Static Web Apps + Supabase + Azure AD + GOV.UK Notify | Production service |

---

*Last updated: May 2026*
