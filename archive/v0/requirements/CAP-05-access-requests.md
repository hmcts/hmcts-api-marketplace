# CAP-05: Access Request Management — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP05-01 | A consumer shall be able to select the API they need access to | Consumer |
| REQ-CAP05-02 | A consumer shall specify the environment they need access to | Consumer |
| REQ-CAP05-03 | A consumer shall specify their expected request volume | Consumer |
| REQ-CAP05-04 | A consumer shall provide the name of their system or application | Consumer |
| REQ-CAP05-05 | A consumer shall provide a business justification of at least 30 characters | Consumer |
| REQ-CAP05-06 | The access request journey shall follow a GDS task list pattern with four steps | System |
| REQ-CAP05-07 | A consumer shall review their answers on a check your answers page before submitting | Consumer |
| REQ-CAP05-08 | A consumer shall confirm two declarations before submission | Consumer |
| REQ-CAP05-09 | On submission, the request shall be stored and visible to the consumer in My requests | System |
| REQ-CAP05-10 | A consumer shall be able to track the status of their requests (pending, approved, rejected) | Consumer |
| REQ-CAP05-11 | The API owner (producer) shall be able to see requests submitted for their APIs | Producer |
| REQ-CAP05-12 | Status updates from the producer shall be reflected in the consumer's My requests panel | System |
| REQ-CAP05-13 | A consumer shall receive an in-portal notification when a decision is made on their request | Consumer |

---

## User Stories

### US-CAP05-01 — Submit an access request
As a consumer I want to submit a structured access request so that the API owner has the information they need to make a decision.

**Acceptance criteria:**
- Given I click Request access, then I see a 4-step task list
- Given I complete all steps, then I reach a check your answers page with Change links
- Given I confirm two declarations, then I can submit
- Given submission succeeds, then I see a GDS confirmation panel with a reference number

### US-CAP05-02 — Track request status
As a consumer I want to see the current status of my requests so that I know when I can start integrating.

**Acceptance criteria:**
- Given I click My requests, then I see all my submitted requests
- Given a request is pending, then it shows a yellow Pending review tag
- Given a request is approved, then it shows a green Approved tag
- Given a request is rejected, then it shows a red Rejected tag with the producer's reason

---

## Prototype status

| Requirement | Status | Notes |
|---|---|---|
| REQ-CAP05-01 to 10 | ✅ Built | Full 4-step journey, check your answers, declarations, status tracking |
| REQ-CAP05-11 | ✅ Built | Producer sees requests via shared _cat_all_reqs store (same browser window) |
| REQ-CAP05-12 | ✅ Built | Consumer My requests reflects producer approve/reject decisions |
| REQ-CAP05-13 | ❌ Outstanding | In-portal notification bell not yet built (CAP-07) |

---

*Last updated: June 2026*
