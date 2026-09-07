# User Journey: Producer — Publish an API

---

## Overview

This journey covers the end-to-end experience of a producer from initial registration through to their API appearing live in the catalogue.

**Primary user:** Producer  
**Related capabilities:** CAP-02, CAP-03, CAP-04  
**Related requirements:** REQ-CAP03-01 through REQ-CAP03-19

---

## Prerequisites

The producer must have a published API specification available via one of:
- SwaggerHub (org/API name/version)
- A publicly accessible URL returning an OpenAPI JSON or YAML file
- A local .json or .yaml file to upload

---

## Journey steps

### 1. Register as a producer

The producer registers with name, organisation, email and password. They select the **Producer** role.

On registration they are taken to the producer dashboard.

---

### 2. Navigate to Publish API

From the producer dashboard sidebar, the producer clicks **Publish API**.

If they have a saved draft, they see a draft-restore notice at the top of the task list with a "Discard draft" option.

---

### 3. Task list overview

A GDS task list shows three sections, each initially marked "Not yet started":

1. API identification
2. Classification and domain
3. Plain-English description

A "Check your answers and submit" button is disabled until all three sections are complete.

---

### 4. Step 1 — API identification

The producer completes:

**API display name**
The name shown in the catalogue. Guidance: use sentence case.

**How will you provide your API specification?**

A GDS conditional reveal radio group with three options:

- **SwaggerHub** — reveals org, API name and version fields. On blur of the version field, the system fetches the spec from SwaggerHub and shows a green confirmation (spec found, endpoint count) or red error (spec not found). The spec is validated before the producer can continue.

- **A URL** — reveals a URL input. On blur, the system fetches the spec from the URL, parses it as JSON or YAML, and shows the same green/red confirmation.

- **Upload a file** — reveals a file input accepting .json, .yaml and .yml up to 2MB. On file selection, the FileReader API parses the spec client-side and shows the confirmation immediately.

The producer clicks **Save and continue**. Errors are shown inline with an error summary if any field is invalid.

---

### 5. Step 2 — Classification and domain

The producer completes:

**Domain** — select from the five HMCTS domains (or Other)

**Data classification** — radio group:
- Official — general government business
- Official-Sensitive — defendant personal data, judiciary information
- Restricted — information whose disclosure could compromise personal safety

**Authentication type** — select from JWT Bearer, API Key, JWT + API Key, CJSCPPUID, Contact team, None

---

### 6. Step 3 — Plain-English description

The producer writes a description of at least 50 characters.

An inset text box reminds the producer: "Write this for a non-technical reader — a delivery manager, product owner or business analyst. Avoid acronyms and technical jargon."

A live character counter turns red below 50 characters and green at or above.

---

### 7. Check your answers

The producer reviews a GDS summary card with all fields and Change links back to the relevant step for each row. The spec source row shows the appropriate label:
- SwaggerHub — HMCTS-DTS / api-name v1.0.0
- URL — https://...
- File upload — openapi.json

---

### 8. Declarations and submit

The producer confirms three declarations:
1. I am authorised to publish this API on behalf of my team
2. The spec is up to date and accurate
3. I understand my team remains responsible for supporting consumers

They click **Submit for review**.

A confirmation panel shows with the API name and a reference number. The submission enters the shared review queue.

---

### 9. Track submission in My APIs

The producer can see all their submissions in the **My APIs** panel with:

- Status tag (Pending review, Approved, Rejected)
- Data classification tag
- Version and authentication type
- Reviewer notes (shown when a decision has been made)
- Edit button (shown for pending submissions)

---

### 10. Receive reviewer decision

When the reviewer acts, the status in My APIs updates automatically.

- **Approved** — API appears in the catalogue. Status changes to green Approved.
- **Rejected** — Status changes to red Rejected. Reviewer's reason is shown. The producer can edit and resubmit.

---

## Draft save and restore

At any point, the producer can navigate away from the Publish API panel. Their progress is saved automatically to localStorage. When they return, the draft is restored — all fields pre-populated, completed steps marked green, and a notice with a "Discard draft" option shown at the top.

---

## Transfer of an existing API

If the producer is bringing an existing API that already has consumers (rather than publishing a brand new one), the journey is the same. The known-source field in the API suggestion flow and the "Does the API currently have consumers?" field in the producer intake questionnaire capture the context needed for the reviewer to assess the transfer.

---

*Last updated: May 2026*
