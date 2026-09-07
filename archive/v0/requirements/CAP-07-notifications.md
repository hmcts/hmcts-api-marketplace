# CAP-07: Notifications & Communications — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP07-01 | A consumer shall receive an in-portal notification when their access request is approved | System |
| REQ-CAP07-02 | A consumer shall receive an in-portal notification when their access request is rejected | System |
| REQ-CAP07-03 | A producer shall receive an in-portal notification when a consumer submits an access request | System |
| REQ-CAP07-04 | A producer shall receive an in-portal notification when their API submission is reviewed | System |
| REQ-CAP07-05 | In-portal notifications shall show an unread count badge in the navigation | System |
| REQ-CAP07-06 | A consumer shall receive an email when their access request is approved or rejected (production) | System |
| REQ-CAP07-07 | Approval emails shall include credentials, documentation link and any usage conditions (production) | System |

---

## Prototype status

In-portal notifications (REQ-CAP07-01 to 05) are achievable without a backend using localStorage. Email notifications (REQ-CAP07-06 to 07) require GOV.UK Notify or equivalent. Neither is currently built.
