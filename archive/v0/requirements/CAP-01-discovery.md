# CAP-01: API Catalogue & Discovery — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP01-01 | The system shall allow any visitor to browse the API catalogue without requiring login or registration | Consumer |
| REQ-CAP01-02 | The system shall allow users to search the catalogue by keyword, domain, description and tags | Consumer |
| REQ-CAP01-03 | The system shall allow users to filter the catalogue by business domain | Consumer |
| REQ-CAP01-04 | The system shall display a data classification label (Official, Official-Sensitive, Restricted) on every API card | System |
| REQ-CAP01-05 | The system shall clearly indicate whether each API requires a formal access request or is openly available | System |
| REQ-CAP01-06 | Each API shall have a detail page with Overview, Endpoints, Data Model, Changelog and Try it out tabs | Consumer |
| REQ-CAP01-07 | Each API detail page shall include a plain-English summary suitable for non-technical readers | Consumer |
| REQ-CAP01-08 | The API detail page sidebar shall suggest related APIs from the same domain | Consumer |
| REQ-CAP01-09 | When search returns no results, the system shall prompt the user to suggest a new API | Consumer |
| REQ-CAP01-10 | API specifications shall be rendered from an embedded fallback immediately, then upgraded from SwaggerHub if available | System |
| REQ-CAP01-11 | APIs approved through the review workflow shall appear in the catalogue alongside built-in APIs | System |
| REQ-CAP01-12 | The catalogue shall support spec sources from SwaggerHub, direct URLs and file uploads | Producer |

---

## User Stories

### US-CAP01-01 — Browse without login
As a visitor I want to browse the API catalogue without logging in so that I can explore what data is available before committing to registration.

**Acceptance criteria:**
- Given I am not logged in, when I open the catalogue, then I see all API cards without any authentication prompt
- Given I am browsing unauthenticated, when I click an API card, then I see the full detail page
- Given I attempt to request access while unauthenticated, then I am prompted to sign in or register

### US-CAP01-02 — Keyword search
As a consumer I want to search by keyword so that I can quickly find an API relevant to my use case.

**Acceptance criteria:**
- Given I type a keyword, when I pause, then the grid filters in real time
- Given I search for a term in a tag, then that API is returned
- Given no results match, then a zero-results state is shown with a suggestion prompt
- Given I clear the search, then all APIs are shown

### US-CAP01-03 — Domain filter
As a consumer I want to filter by domain so that I can narrow results to my area of interest.

**Acceptance criteria:**
- Given I click a domain filter, then only APIs in that domain are shown
- Given I have an active domain filter and type a search term, then both apply simultaneously
- Given I click All, then all filters are cleared

### US-CAP01-04 — API detail page
As a developer I want full technical documentation in one place so that I can integrate without leaving the catalogue.

**Acceptance criteria:**
- Given I click an API card, then I see a detail page with 5 tabs
- Given I click Endpoints, then I see all endpoints with method, path, parameters and response codes
- Given I click Data Model, then I see all schemas with field names, types and descriptions
- Given I click Try it out, then I see mock server URLs
- Given the SwaggerHub spec is reachable, then live data is shown and the sync bar shows green
- Given the SwaggerHub spec is unreachable, then embedded spec data is shown

### US-CAP01-05 — Plain-English summary
As a business analyst I want a plain-English description so that I can assess relevance without technical knowledge.

**Acceptance criteria:**
- Given I open an API detail page, then the Overview tab shows a plain-English summary
- Given the summary is displayed, then it is labelled as a non-technical summary

### US-CAP01-06 — Suggest new API when not found
As a consumer I want to be prompted to suggest a new API when my search returns nothing so that I have a clear path forward.

**Acceptance criteria:**
- Given my search returns no results, then a prompt appears linking to the Suggest an API flow
- Given I click the prompt, then I am taken to the suggestion form (or prompted to sign in first)

---

## Prototype status

| Requirement | Status | Notes |
|---|---|---|
| REQ-CAP01-01 | ✅ Built | |
| REQ-CAP01-02 | ✅ Built | |
| REQ-CAP01-03 | ✅ Built | |
| REQ-CAP01-04 | ✅ Built | On submitted/approved APIs |
| REQ-CAP01-05 | ✅ Built | Auth type shown on cards |
| REQ-CAP01-06 | ✅ Built | |
| REQ-CAP01-07 | ✅ Built | |
| REQ-CAP01-08 | ❌ Outstanding | Small effort, no backend needed |
| REQ-CAP01-09 | ✅ Built | Links to Suggest an API flow |
| REQ-CAP01-10 | ✅ Built | |
| REQ-CAP01-11 | ✅ Built | |
| REQ-CAP01-12 | ✅ Built | |
