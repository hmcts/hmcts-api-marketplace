# CAP-03: API Publication & Onboarding — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP03-01 | A producer shall be able to provide an API display name | Producer |
| REQ-CAP03-02 | A producer shall be able to provide a spec via SwaggerHub (org, API name, version) | Producer |
| REQ-CAP03-03 | A producer shall be able to provide a spec via a direct URL to an OpenAPI file | Producer |
| REQ-CAP03-04 | A producer shall be able to provide a spec by uploading a .json or .yaml file | Producer |
| REQ-CAP03-05 | The system shall validate the spec on blur and confirm the spec exists and has endpoints | System |
| REQ-CAP03-06 | A producer shall select a data classification (Official, Official-Sensitive, Restricted) | Producer |
| REQ-CAP03-07 | A producer shall select a business domain | Producer |
| REQ-CAP03-08 | A producer shall select an authentication type | Producer |
| REQ-CAP03-09 | A producer shall provide a plain-English description of at least 50 characters | Producer |
| REQ-CAP03-10 | The system shall display a live character counter on the description field | System |
| REQ-CAP03-11 | The publication journey shall follow a GDS task list pattern with three steps | System |
| REQ-CAP03-12 | A producer shall review their answers on a check your answers page before submitting | Producer |
| REQ-CAP03-13 | A producer shall confirm three declarations before submission | Producer |
| REQ-CAP03-14 | The system shall save a draft automatically and restore it when the producer returns | System |
| REQ-CAP03-15 | A producer shall be able to edit a pending submission | Producer |
| REQ-CAP03-16 | On submission, the API shall be written to a shared review queue visible to reviewers | System |
| REQ-CAP03-17 | The producer shall see the current status of each submission in their My APIs panel | Producer |
| REQ-CAP03-18 | Reviewer notes shall be visible to the producer in their My APIs panel | Reviewer |
| REQ-CAP03-19 | The producer shall receive a reference number on submission | System |

---

## Prototype status

All 19 requirements are met in the prototype. The only remaining gap — shared localStorage vs a real shared backend — is infrastructure, not a feature.
