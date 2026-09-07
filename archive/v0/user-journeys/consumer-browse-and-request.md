# User Journey: Consumer — Browse, Discover and Request Access

---

## Overview

This journey covers the end-to-end experience of a consumer from first visit to approved API access. It includes both the unauthenticated browse path and the authenticated access request path.

**Primary user:** Consumer  
**Related capabilities:** CAP-01, CAP-02, CAP-05, CAP-06, CAP-07, CAP-09

---

## Journey steps

### 1. Arrive at the catalogue (unauthenticated)

The consumer visits the catalogue. No login is required.

- They see the home page with all API cards visible
- Each card shows the API name, domain, version, auth type and a short description
- A search bar and domain filter pills are visible
- No barrier, no prompt to sign in

**Requirements satisfied:** REQ-CAP01-01, REQ-01

---

### 2. Search and filter

The consumer uses search or filters to find relevant APIs.

- They type a keyword — results filter in real time across name, description, domain and tags
- They click a domain pill to narrow further
- If nothing is found, a zero-results state prompts them to suggest a new API
- If they find what they need, they click the API card

**Requirements satisfied:** REQ-CAP01-02, REQ-CAP01-03, REQ-CAP01-09

---

### 3. Read the API detail page

The consumer opens the API detail page.

- The Overview tab shows a plain-English summary (non-technical)
- The Endpoints tab shows all endpoints with method, path, parameters and response codes
- The Data Model tab shows schemas with field names and types
- The Changelog tab shows version history
- The Try it out tab shows mock server URLs and example requests
- The sidebar shows API information, authentication type and response codes
- Related APIs from the same domain are shown in the sidebar

**Requirements satisfied:** REQ-CAP01-06, REQ-CAP01-07, REQ-CAP01-08

---

### 4. Try the mock server (optional, unauthenticated)

The consumer tries the API against the SwaggerHub mock server.

- Mock server URL is shown on the Try it out tab
- Example requests are listed with method, path and description
- No credentials are needed to call the mock server
- This confirms the API does what they need before they request access

**Requirements satisfied:** REQ-CAP11-01 (partial)

---

### 5. Request access

The consumer clicks "Request access". If not signed in, they are prompted to register or sign in first. After authentication they are returned to the access request flow.

#### Step 1 — Which API?
- Select the API from a dropdown (includes all catalogue APIs)

#### Step 2 — Environment and volume
- Select environment (Production, Staging, Development)
- Select expected request volume (Low, Medium, High)

#### Step 3 — Your system details
- Enter the name of the system or application that will call the API

#### Step 4 — Business justification
- Enter a justification describing the use case and why this data is needed (minimum 30 characters)

**Requirements satisfied:** REQ-CAP05-01 through REQ-CAP05-06

---

### 6. Check your answers and submit

The consumer reviews a summary of all four steps with Change links for each answer. They confirm two declarations and submit.

A GDS confirmation panel shows with a reference number. The consumer is told the API owner will review within 2 business days.

**Requirements satisfied:** REQ-CAP05-07, REQ-CAP05-08, REQ-CAP05-09

---

### 7. Track request status

The consumer can return to My Requests to see the current status of all their requests.

- Pending — shown in yellow
- Approved — shown in green
- Rejected — shown in red with the producer's reason

**Requirements satisfied:** REQ-CAP05-10

---

### 8. Receive outcome notification

When the producer makes a decision, the consumer is notified.

- In-portal: notification bell badge updates; notification shown in panel
- Email (production): email sent via GOV.UK Notify with outcome and next steps
- On approval: credentials are provided
- On rejection: the producer's reason is shown with guidance to revise and resubmit

**Requirements satisfied:** REQ-CAP05-12, REQ-CAP05-13, REQ-CAP07-01, REQ-CAP07-02

---

## Alternative path — what if the API doesn't exist?

If the consumer searches and cannot find the data they need:

1. Zero-results state shows a prompt: "Suggest a new API to the marketplace team"
2. Consumer clicks the link (prompted to sign in if not already)
3. Consumer completes the Suggest an API form
4. Confirmation panel shows with reference number
5. Reviewer sees the suggestion in their API suggestions panel with a new-badge count

See [consumer-suggest-api.md](consumer-suggest-api.md) for the full suggest journey.

---

## Error and edge cases

| Scenario | Behaviour |
|---|---|
| Consumer submits request without being logged in | Prompted to sign in or register, then returned to request form |
| Consumer submits duplicate request for same API | System should prevent a second active request for the same API (not yet built) |
| Producer does not respond within SLA | Automated reminder sent to producer (not yet built) |
| Consumer wants to withdraw a request | Not yet built |

---

*Last updated: May 2026*
