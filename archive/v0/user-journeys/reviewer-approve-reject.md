# User Journey: Reviewer — Review and Approve/Reject an API Submission

---

## Overview

This journey covers the reviewer's experience from receiving a new API submission through to making an approval or rejection decision, and managing consumer API suggestions.

**Primary user:** Reviewer  
**Related capabilities:** CAP-04, CAP-12  
**Related requirements:** REQ-CAP04-01 through REQ-CAP04-10

---

## Prerequisites

The reviewer must be registered with the **Reviewer** role. They cannot self-register as a reviewer in production — the reviewer role should be assigned by a platform administrator.

---

## Journey steps

### 1. Sign in to the reviewer dashboard

The reviewer signs in and is routed to their dedicated reviewer dashboard.

The dashboard shows three navigation items:
- **Overview** — summary statistics (pending, approved, rejected)
- **Review queue** — all pending submissions
- **Reviewed** — history of actioned submissions
- **API suggestions** — consumer demand signals with unread badge count

---

### 2. Review the overview

The overview panel shows:
- Count of submissions pending review
- Count of approvals made
- Count of rejections made
- Review criteria (the five standards an API must meet to be approved)
- Summary of the reviewer role and responsibilities

**Review criteria:**
1. The SwaggerHub spec exists and has at least one endpoint
2. The plain-English description is clear and accurate
3. The data classification is correctly applied
4. The API name follows naming conventions
5. The owning team is contactable

---

### 3. Open the review queue

The reviewer clicks **Review queue**. Pending submissions are shown oldest-first, each as a card with:
- API name and SwaggerHub identifier
- Submitter name and organisation
- Time since submission
- Status tag (Pending review)
- A short extract of the plain-English description
- Domain, classification and authentication tags
- A **Review this submission** button

---

### 4. View submission detail

The reviewer clicks **Review this submission**. They see the full submission detail:

A GDS summary list showing every field submitted by the producer:
- API name
- SwaggerHub identifier (org / API name)
- Version
- Domain
- Data classification
- Authentication type
- Plain-English description
- Submitter name and organisation
- Submission timestamp

A **View spec on SwaggerHub** button opens the spec in a new tab, allowing the reviewer to verify it exists and review the endpoints.

---

### 5a. Approve

The reviewer clicks **Approve and publish**.

They are taken to an action confirmation page showing a summary of the submission. An optional notes field lets them add guidance for the producer.

They click **Confirm: approve and publish**.

**What happens:**
- The submission status updates to Approved
- The API is written to the shared approved APIs store
- The API appears in the catalogue immediately, visible to all users
- The producer's My APIs panel shows the Approved status and any notes
- The reviewer is shown a GDS confirmation panel

---

### 5b. Reject

The reviewer clicks **Reject submission**.

They are taken to an action confirmation page. A **required** notes field must be completed before rejection is confirmed.

They click **Confirm: reject submission**.

**What happens:**
- The submission status updates to Rejected
- The producer's My APIs panel shows the Rejected status and the reviewer's reason
- The producer can edit their submission and resubmit
- The reviewer is shown a GDS confirmation panel

If the reviewer tries to confirm rejection without entering a reason, an inline error stops them.

---

### 6. View reviewed history

The reviewer's **Reviewed** panel shows all previously actioned submissions, sorted newest-first. Each card shows:
- API name and identifier
- Outcome (Approved or Rejected)
- The notes they left
- A View details link to see the full submission

---

### 7. Manage API suggestions

The reviewer clicks **API suggestions**. A red badge shows the count of new suggestions.

Each suggestion shows:
- What the consumer would call the API
- The data they need (full text)
- Their business justification
- Their system name
- Any known existing source they mentioned
- Submitter name, organisation and time since submission

The reviewer can:
- Update the status (New → Noted → In Progress → Declined)
- Add a note for the consumer (visible in their suggestion history)

---

## Governance considerations

For Official-Sensitive APIs, an additional governance review stage should be introduced before the API owner sees the submission. This allows an Information Governance representative to validate compliance before the API enters the catalogue.

This stage is not yet built in the prototype but is defined in REQ-CAP06-03.

---

## Error and edge cases

| Scenario | Behaviour |
|---|---|
| Reviewer tries to reject without a reason | Error shown, rejection prevented |
| Producer edits a submission after rejection | New submission enters the queue as a revised submission |
| Reviewer approves an API with an invalid spec URL | Not prevented in prototype — spec validation at submission time is the guard |

---

*Last updated: May 2026*
