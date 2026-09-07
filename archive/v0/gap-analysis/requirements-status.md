# Requirements Status — api-catalogue-v7

**Date:** June 2026 | **Scope:** CAP-01, CAP-03, CAP-05, CAP-06 (actively developed capabilities)

---

## CAP-01: API Catalogue & Discovery — 11/12 (92%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP01-01 | Browse without login | ✅ |
| REQ-CAP01-02 | Keyword search | ✅ |
| REQ-CAP01-03 | Domain filter | ✅ |
| REQ-CAP01-04 | Data classification on cards | ✅ |
| REQ-CAP01-05 | Access type indicator | ✅ |
| REQ-CAP01-06 | 5-tab detail page | ✅ |
| REQ-CAP01-07 | Plain-English summary | ✅ |
| REQ-CAP01-08 | Related APIs in sidebar | ❌ Outstanding |
| REQ-CAP01-09 | Zero-results → Request a new API | ✅ |
| REQ-CAP01-10 | Embedded + live spec | ✅ |
| REQ-CAP01-11 | Approved APIs in catalogue | ✅ |
| REQ-CAP01-12 | Multiple spec sources | ✅ |

---

## CAP-03: API Publication & Onboarding — 19/19 (100%)

All requirements met. See CAP-03-publication.md for full detail.

---

## CAP-05: Access Request Management — 13/13 (100%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP05-01 | API selection | ✅ |
| REQ-CAP05-02 | Environment selection | ✅ |
| REQ-CAP05-03 | Volume selection | ✅ |
| REQ-CAP05-04 | System name field | ✅ |
| REQ-CAP05-05 | Business justification | ✅ |
| REQ-CAP05-06 | 4-step task list | ✅ |
| REQ-CAP05-07 | Check your answers | ✅ |
| REQ-CAP05-08 | Declaration checkboxes (×2) | ✅ |
| REQ-CAP05-09 | Request stored | ✅ |
| REQ-CAP05-10 | Consumer status tracking | ✅ |
| REQ-CAP05-11 | Request visible to API owner | ✅ |
| REQ-CAP05-12 | Status updates to consumer | ✅ |
| REQ-CAP05-13 | In-portal notification | ❌ CAP-07 |

---

## CAP-06: Access Request Approval Workflow — 4/8 (50%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP06-01 | Validate request fields | ✅ |
| REQ-CAP06-02 | Route to API owner | ✅ |
| REQ-CAP06-03 | Governance stage for Official-Sensitive | ❌ Outstanding |
| REQ-CAP06-04 | Approve or reject with notes | ✅ |
| REQ-CAP06-05 | Request further information | ❌ Outstanding |
| REQ-CAP06-06 | SLA enforcement | ❌ Requires backend |
| REQ-CAP06-07 | SLA breach reminders | ❌ Requires backend |
| REQ-CAP06-08 | Consumer resubmit after rejection | ❌ Outstanding |

---

## Additional capabilities built (not in original gap analysis)

| Feature | Description |
|---|---|
| Request a new API | Consumer 8-field form for requesting new APIs not in the catalogue |
| Permission-based auth | `defaultPermissions()` and `hasPermission()` model replacing role string checks |

---

## Definition of done

A requirement is **done** when:
1. All acceptance criteria scenarios pass in the browser
2. No console errors on the happy path
3. GOV.UK Frontend component pattern used where one exists
4. Keyboard navigation works
5. Error states are handled
6. The file is saved to the project and pushed to the repo

---

*Last updated: June 2026*

---

# Requirements Status — prototype-mvp

**Date:** June 2026 | **Scope:** MVP no-auth prototype

---

## CAP-01: API Catalogue & Discovery

| Req | Description | Status |
|---|---|---|
| REQ-CAP01-01 | Browse without login | ✅ |
| REQ-CAP01-02 | Keyword search | ✅ |
| REQ-CAP01-03 | Domain filter | ✅ |
| REQ-CAP01-04 | Data classification on cards | ✅ |
| REQ-CAP01-05 | Access type (OAuth 2.0) indicator | ✅ |
| REQ-CAP01-06 | 5-tab detail page | ✅ |
| REQ-CAP01-07 | Plain-English summary | ✅ |
| REQ-CAP01-08 | Related APIs in sidebar | ❌ Outstanding |
| REQ-CAP01-09 | Zero-results → Request a new API | ❌ Not built |
| REQ-CAP01-10 | Live spec fetch | ✅ |
| REQ-CAP01-11 | API information sidebar from spec | ✅ |
| REQ-CAP01-12 | Response codes from spec | ✅ |
| REQ-CAP01-13 | Spec status indicator (sync bar) | ✅ |

## CAP-03: API Publication (MVP simplified)

| Req | Description | Status |
|---|---|---|
| REQ-CAP03-MVP-01 | Publish API form | ✅ |
| REQ-CAP03-MVP-02 | GitHub repo URL field | ✅ |
| REQ-CAP03-MVP-03 | Live spec URL preview | ✅ |
| REQ-CAP03-MVP-04 | Domain and classification fields | ✅ |
| REQ-CAP03-MVP-05 | Plain-English description | ✅ |
| REQ-CAP03-MVP-06 | Declaration checkboxes (×4) | ✅ |
| REQ-CAP03-MVP-07 | Email submission | ✅ |

## CAP-05: Access Request (MVP simplified)

| Req | Description | Status |
|---|---|---|
| REQ-CAP05-MVP-01 | API selection dropdown (from catalogue) | ✅ |
| REQ-CAP05-MVP-02 | Environment selection | ✅ |
| REQ-CAP05-MVP-03 | Call volume field | ✅ |
| REQ-CAP05-MVP-04 | Use case / justification | ✅ |
| REQ-CAP05-MVP-05 | OAuth capability declaration | ✅ |
| REQ-CAP05-MVP-06 | Personal and organisation details | ✅ |
| REQ-CAP05-MVP-07 | Declaration checkboxes (×4) | ✅ |
| REQ-CAP05-MVP-08 | Email submission | ✅ |

## CAP-11: Developer & Business UX

| Req | Description | Status |
|---|---|---|
| REQ-CAP11-MVP-01 | Onboarding guide (consumer steps) | ✅ |
| REQ-CAP11-MVP-02 | Onboarding guide (producer steps) | ✅ |
| REQ-CAP11-MVP-03 | Consumer guidance page | ✅ |
| REQ-CAP11-MVP-04 | Producer standards page | ✅ |
| REQ-CAP11-MVP-05 | Data governance page | ✅ |
| REQ-CAP11-MVP-06 | Consistent footer navigation | ✅ |
