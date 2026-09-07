# User Journey: Consumer — Suggest a New API

---

## Overview

This journey covers the flow for a consumer who cannot find the data they need in the catalogue and wants to formally request that a new API be created or listed.

This is a distinct journey from requesting access to an existing API. It is a demand signal, not an access request.

**Primary user:** Consumer  
**Related capabilities:** CAP-01 (REQ-CAP01-09), CAP-05 (adjacent)  
**Original requirements:** REQ-16, REQ-17, REQ-18, REQ-19

---

## Entry points

There are two ways to reach the Suggest an API flow:

1. **From zero-results search** — when the catalogue returns no results, a prompt appears: "Suggest a new API to the marketplace team". This links directly to the suggestion form. If the consumer is not signed in, they are prompted to register or sign in first.

2. **From the consumer dashboard** — a "Suggest an API" item in the consumer dashboard sidebar navigation.

---

## Journey steps

### 1. Open the suggestion form

The consumer navigates to the Suggest an API panel. The form has a clear distinction from the access request flow — an inset text message explains this is for requesting a new API, not accessing an existing one, with a link to the access request form for consumers who have come to the wrong place.

---

### 2. Complete the suggestion form

The consumer completes five required fields and one optional field.

**Required fields:**

| Field | Description |
|---|---|
| API name | A short descriptive name for the API they need |
| Business domain | Which domain the API relates to |
| Data needed | A specific description of the data they need |
| Business justification | Why their system needs this data |
| System name | The system or service that would consume the API |

**Optional field:**

| Field | Description |
|---|---|
| Known source | Whether the consumer knows of an existing API or data source that provides this data |

The optional known-source field is important — it surfaces existing APIs that may not yet be listed on the marketplace, turning the suggestion into a fast-track publication request.

---

### 3. Validation

All required fields are validated on submission. Errors follow the GDS error summary pattern:

- Error summary appears above the page heading listing all errors with anchor links
- Inline error messages appear below each field label
- Red border on the field in error

---

### 4. Submit

The consumer clicks Submit request. A GDS confirmation panel appears with:

- The name of the API they suggested
- A reference number for tracking
- A message that the marketplace team will review and contact them if needed

**Requirements satisfied:** REQ-19

---

### 5. Track suggestion history

Below the form, a My previous suggestions section shows all the consumer's past suggestions with:

- API name and domain
- Reference number
- Time since submission
- Status tag (New, Noted, In Progress, Declined)
- Any note the reviewer has added

---

## Reviewer experience (REQ-18)

The reviewer sees all consumer suggestions in an API Suggestions panel in their reviewer dashboard.

- A red badge on the nav item shows the count of new unreviewed suggestions
- Each suggestion is shown with full detail — data need, justification, system name and known source
- The reviewer can update the status (New → Noted → In Progress → Declined)
- The reviewer can add a note for the consumer, which appears in the consumer's suggestion history

---

## What happens next (not yet built)

In a full production implementation, the marketplace team would:

1. Investigate whether the API already exists somewhere in HMCTS
2. Engage the relevant team to discuss whether publication is feasible
3. If a new API needs to be built, raise this with the appropriate programme team
4. Update the suggestion status in the marketplace to keep the consumer informed
5. Notify the consumer when the API is listed (or explain why it won't be)

---

*Last updated: May 2026*
