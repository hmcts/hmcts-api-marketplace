# CAP-12: Governance, Compliance & Audit — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP12-01 | Every published API shall have a data classification (Official, Official-Sensitive, Restricted) | System |
| REQ-CAP12-02 | The system shall maintain an immutable audit trail of all submissions, approvals and rejections | System |
| REQ-CAP12-03 | The system shall track GDPR and DSA compliance status per API | System |
| REQ-CAP12-04 | An access log shall record who has access to which API, when it was granted, and under what justification | System |
| REQ-CAP12-05 | Compliance checks shall be part of the publication review criteria | Reviewer |
| REQ-CAP12-06 | Data retention policies shall be configurable per classification level | Administrator |

---

## Prototype status

REQ-CAP12-01 is built (classification field on publish form, surfaced on cards). REQ-CAP12-02 through 06 require a backend database.
