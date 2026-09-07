# CAP-04: API Publication Review & Approval — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP04-01 | A reviewer shall see all pending API submissions in a review queue | Reviewer |
| REQ-CAP04-02 | The review queue shall show submissions sorted oldest-first | System |
| REQ-CAP04-03 | A reviewer shall be able to view the full detail of a submission | Reviewer |
| REQ-CAP04-04 | The submission detail view shall show all fields submitted by the producer | Reviewer |
| REQ-CAP04-05 | A reviewer shall be able to approve a submission with optional notes | Reviewer |
| REQ-CAP04-06 | Approving a submission shall publish the API to the catalogue immediately | System |
| REQ-CAP04-07 | A reviewer shall be able to reject a submission with mandatory reason notes | Reviewer |
| REQ-CAP04-08 | The producer shall see the outcome and any reviewer notes in their My APIs panel | System |
| REQ-CAP04-09 | The reviewer shall have a history panel showing all previously reviewed submissions | Reviewer |
| REQ-CAP04-10 | Reviewer decisions shall include a timestamp and reviewer name | System |

---

## User Stories

### US-CAP04-01 — Review queue
As a reviewer I want to see all pending API submissions so that I can work through them in order.

**Acceptance criteria:**
- Given I sign in as a reviewer, then I see a review queue panel
- Given submissions exist, then they are shown oldest-first
- Given the queue is empty, then a clear empty state is shown

### US-CAP04-02 — Approve a submission
As a reviewer I want to approve an API submission so that it becomes available in the catalogue.

**Acceptance criteria:**
- Given I click Approve, then I can add optional notes and confirm
- Given I confirm approval, then the API appears in the catalogue immediately
- Given the approval is confirmed, then the producer sees "Approved" in their My APIs panel

### US-CAP04-03 — Reject a submission
As a reviewer I want to reject a submission with a clear reason so that the producer knows what to address.

**Acceptance criteria:**
- Given I click Reject, then I must enter a reason before confirming
- Given I try to confirm rejection without a reason, then an error is shown
- Given rejection is confirmed, then the producer sees "Rejected" and the reason in My APIs

---

## Prototype status

All 10 requirements are built. Reviewer decisions use localStorage which means they are only visible within the same browser session. Moving to Supabase makes this cross-user.
