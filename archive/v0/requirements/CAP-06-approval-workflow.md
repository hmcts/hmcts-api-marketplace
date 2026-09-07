# CAP-06: Access Request Approval Workflow — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP06-01 | The system shall automatically validate that all required fields are completed before routing a request | System |
| REQ-CAP06-02 | The system shall route validated requests to the relevant API owner | System |
| REQ-CAP06-03 | The system shall support a governance review stage for Official-Sensitive APIs | Reviewer |
| REQ-CAP06-04 | An API owner shall be able to approve or reject an access request with mandatory notes on rejection | Producer |
| REQ-CAP06-05 | An API owner shall be able to request further information from the consumer | Producer |
| REQ-CAP06-06 | The system shall enforce a defined SLA for access request decisions | System |
| REQ-CAP06-07 | Automated reminders shall be sent to the API owner if the SLA is breached | System |
| REQ-CAP06-08 | A consumer shall be able to resubmit an access request after rejection | Consumer |

---

## User Stories

### US-CAP06-01 — Producer sees incoming requests
As a producer I want to see access requests for my APIs so that I can review and action them.

**Acceptance criteria:**
- Given I sign in as a producer, then I see an Access requests panel in my dashboard
- Given pending requests exist, then they appear in the Pending tab with consumer name, API, system and time submitted
- Given I have actioned requests, then they appear in the Actioned tab
- Given new requests arrive, then a red badge on the nav shows the count

### US-CAP06-02 — Producer reviews request detail
As a producer I want to see the full detail of an access request so that I can make an informed decision.

**Acceptance criteria:**
- Given I click Review request, then I see all fields: API name, consumer, organisation, system, environment, volume and business justification
- Given I have previously actioned a request, then I can still view its detail

### US-CAP06-03 — Producer approves a request
As a producer I want to approve a consumer access request so that they can integrate with my API.

**Acceptance criteria:**
- Given I click Approve access, then I can add an optional note for the consumer
- Given I confirm approval, then the request status updates to Approved
- Given the request is approved, then the consumer sees Approved (green) in My requests
- Given the request is approved, then any note I added is visible to the consumer

### US-CAP06-04 — Producer rejects a request
As a producer I want to reject a request with a clear reason so that the consumer knows what to address.

**Acceptance criteria:**
- Given I click Reject request, then I must enter a reason before confirming
- Given I try to confirm without a reason, then an error message stops me
- Given I confirm rejection, then the consumer sees Rejected (red) in My requests with my reason

---

## Prototype status

| Requirement | Status | Notes |
|---|---|---|
| REQ-CAP06-01 | ✅ Built | Request written to shared store on submission |
| REQ-CAP06-02 | ✅ Built | Producer sees all requests in demo mode; own API requests in production mode |
| REQ-CAP06-03 | ❌ Outstanding | Governance stage not yet built |
| REQ-CAP06-04 | ✅ Built | Approve with optional note; reject with mandatory reason |
| REQ-CAP06-05 | ❌ Outstanding | Request further info flow not yet built |
| REQ-CAP06-06 | ❌ Outstanding | Requires backend |
| REQ-CAP06-07 | ❌ Outstanding | Requires backend + GOV.UK Notify |
| REQ-CAP06-08 | ❌ Outstanding | Resubmit flow not yet built |

## Prototype note — localStorage limitation

Because this prototype uses browser localStorage, consumer and producer accounts must use the **same browser window** (different tabs) to share data. In production this is resolved by Supabase — all requests are written to a shared database visible to all authenticated users.

A **"Load a demo request"** button is available in the producer Access requests panel to simulate the flow without needing two tabs.

---

*Last updated: June 2026*
