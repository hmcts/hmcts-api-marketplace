# Implementation Plan: Capturing & Managing API Access Requests

**Status:** Draft for review | **Date:** June 2026 | **Author:** AMP / Marketplace team
**Relates to:** `CAP-05` (access requests), `CAP-06` (approval workflow), `CAP-07` (notifications), `CAP-09` (credentials)

> This plan replaces the prototype's `mailto:` + `localStorage` approach with a production architecture for capturing, routing, approving and tracking API access requests. It is backed by a cited research pass (June 2026) into how comparable government API programmes solve this, and into the Azure-native tooling available to us. Confidence levels are marked per claim; see [Evidence base](#evidence-base).

---

## 1. Where we are today

The catalogue is a static, single-file GOV.UK Frontend app (`prototype-mvp/index.html`, served from `docs/`). Today an access request:

1. is entered into the **`accessRequestPage`** form (`submitAccessRequest()`);
2. is serialised to a text body and handed to the user's mail client via **`mailto:Nagashankar.Ponnaganti@HMCTS.NET`**;
3. is **not persisted** anywhere the team controls — no queue, no status, no audit, no SLA. The on-screen reference (`AR-2025-001`) is hardcoded.

The full prototype simulates the *intended* lifecycle (routing to producers, approve/reject, consumer status tracking) using `localStorage`, which the `CAP-06` note itself flags as a stopgap pending a real backend. So the gap to close is well-understood; this plan picks the production mechanism.

---

## 2. What the research tells us (principles)

These shape every decision below. Full citations in [§8](#evidence-base).

1. **The mature government pattern is two-tier: self-service portal + human-gated sensitive access.** HMRC runs a self-service developer hub (register → create application → subscribe to APIs → `client_id` issued automatically), but **production access passes a human review of up to 10 working days**, and developers test in a sandbox first. NHS England goes heavier still — a multi-stage assurance process (security, clinical safety, information governance) and a legally-signed Connection Agreement before go-live. *[High confidence]*

2. **A catalogue is not an access-control system — and shouldn't pretend to be.** The central GOV.UK API Catalogue (`api.gov.uk`) is deliberately **discovery-only**: no key issuance, no credential management; it directs users to each API's own docs, and "listing does not mean publicly accessible." Access control is owned by each publishing team. *[High confidence]* **Implication:** HMCTS must own request-capture itself; we cannot offload it to the central catalogue.

3. **Gate by data sensitivity, not one-size-fits-all.** HMRC tiers every endpoint: *open* (no token), *application-restricted* (OAuth2 client-credentials, no sensitive personal data), *user-restricted* (OAuth2 auth-code, scoped to the user's own data). This maps cleanly onto our **OFFICIAL vs OFFICIAL-SENSITIVE** split and CAP-06's "governance review stage for Official-Sensitive APIs." *[High confidence]*

4. **There is a central platform to align with, not duplicate.** GDS completed a 12-week **cross-government API hub alpha (Nov 2025)** and is building an MVP with a refreshed catalogue, per-API quality/security scores, and **a signed-in developer portal**. The alpha was delivered by GDS **in partnership with Scrumconnect**. *[High confidence]* **Implication:** design HMCTS's catalogue to feed/federate into the central hub rather than diverge from it — and use the Scrumconnect link to coordinate.

5. **The international pattern agrees:** the US (`api.data.gov`) issues a single self-service API key across federal APIs as a proxy layer; Singapore (APEX) runs one government-wide API hub with standardised security; Australia (`api.gov.au`) is standards-and-catalogue only. Self-service + a managed gateway is the convergent answer. *[Supporting]*

---

## 3. Target architecture (Azure-native)

Because HMCTS is an Azure + M365 organisation, the mature-government pattern is available largely **as configuration of platform we already own**, rather than custom build.

```
                        ┌──────────────────────────────────────────────┐
   Consumer / Producer  │  GOV.UK Frontend catalogue                    │
   (browser)            │  Azure Static Web Apps (static site + /api)   │
                        └───────────────┬──────────────────────────────┘
                                        │ signed in via
                                        ▼
                        ┌──────────────────────────────────────────────┐
                        │  Microsoft Entra ID  (staff: workforce tenant)│
                        │  Entra External ID   (other-org consumers)    │
                        └───────────────┬──────────────────────────────┘
                                        │ request access =
                                        ▼
                        ┌──────────────────────────────────────────────┐
                        │  Azure API Management (APIM)                  │
                        │  • Developer portal: products & subscriptions │
                        │  • Subscription approval (auto OR publisher)  │
                        │  • Gateway: validate-jwt / validate-azure-ad- │
                        │    token + rate-limit / quota policies        │
                        └──────┬───────────────────────────┬───────────┘
                               │ approval events            │ records / demand signals
                               ▼                            ▼
                  ┌────────────────────────┐   ┌──────────────────────────────┐
                  │  GOV.UK Notify (REST)  │   │  Azure Database for PostgreSQL │
                  │  email to consumer /   │   │  (or Azure SQL) — UK region    │
                  │  SLA reminder to owner │   │  bespoke data: "request a new  │
                  └────────────────────────┘   │  API" signals, audit, metadata │
                                               └──────────────────────────────┘
                  secrets in Azure Key Vault · glue in Azure Functions
```

### Component choices and why

| Concern | Choice | Evidence / rationale |
|---|---|---|
| **Access request → approval → credentials** | **Azure API Management** subscriptions | APIM subscriptions are *the* access mechanism: a named container for keys; the gateway rejects any call without a valid key. Developers find **products** in the portal, submit subscription requests, and get keys **approved automatically or by a publisher** — i.e. the entire `CAP-05`/`CAP-06`/`CAP-09` lifecycle is native config. *[High]* |
| **Gateway auth for sensitive APIs** | APIM `validate-jwt` / `validate-azure-ad-token` + Entra | APIM validates OAuth2/JWT (incl. Entra tokens) at the gateway inbound, checks issuer/audience, 401s invalid tokens. Microsoft notes a **subscription key alone is not strong auth** — pair it with OAuth for OFFICIAL-SENSITIVE. *[High]* |
| **Identity — staff** | **Entra ID workforce tenant** (+ B2B) | Staff already have Entra identities; B2B collaboration covers partners/guests. *[High]* |
| **Identity — external/other-org consumers** | **Entra External ID** (external tenant) | The next-gen CIAM platform (not a B2C rename). **Azure AD B2C is end-of-sale to new customers since 1 May 2025** — a greenfield service *cannot* buy B2C, so External ID is the only forward choice. ⚠️ External ID is **public-cloud only** (no UK sovereign/gov cloud variant); confirm against HMCTS data-residency rules. *[High]* |
| **Front-end hosting** | **Azure Static Web Apps** | Static site + integrated **Azure Functions** `/api` + Entra auth in one product — a near-exact fit for this app once it needs a backend. Replaces GitHub Pages for the real service. *[Supporting]* |
| **Glue / secrets** | **Azure Functions** + **Azure Key Vault** | Functions hold the Notify API key and any APIM admin calls; Key Vault stores secrets. Replaces the never-viable idea of a token in browser JS. *[Supporting]* |
| **Bespoke data** (demand signals, audit, metadata not in APIM) | **Azure Database for PostgreSQL** (or Azure SQL), **UK region** | Same Postgres capability as Supabase, **in our tenant and a UK region**, billed/governed through existing Azure agreements. Azure is in-scope under **UK G-Cloud for OFFICIAL data**. *[Supporting]* |
| **Notifications** | **GOV.UK Notify** | GDS product for email/SMS/letters via a **public REST API** → callable from an Azure Function. Free for public-sector teams and the gov-standard choice. **Keep this even on Azure** — do not swap for an Azure email service. *[Supporting]* |

---

## 4. How this satisfies the requirements

| Requirement | Met by |
|---|---|
| `CAP-05` capture structured request, consumer can track status | APIM developer-portal subscription request; status visible in portal + mirrored in our SWA front-end |
| `CAP-05-11/12` producer sees requests for *their* APIs; status reflected to consumer | APIM per-product publisher approval; producer = product owner |
| `CAP-06-02` route to relevant API owner | Product ownership / approver assignment in APIM |
| `CAP-06-03` governance stage for Official-Sensitive | Sensitivity-tiered products (see §5) + manual approval + OAuth requirement |
| `CAP-06-04` approve/reject with mandatory rejection note | Publisher approval action; rejection note captured in our request record (Functions + Postgres) |
| `CAP-06-06/07` SLA + breach reminders | Functions timer + GOV.UK Notify reminder to the owner |
| `CAP-05-13`/`CAP-07` consumer notified on decision | GOV.UK Notify email on approval/rejection |
| `CAP-09` credentials | APIM subscription keys (+ OAuth client) issued automatically on approval |
| "Request a new API" demand signal | Separate form → Functions → Postgres table + Notify to marketplace team (no APIM product exists yet, so this stays bespoke) |

---

## 5. Sensitivity tiering (the HMRC model, applied)

| Tier | Example APIs | APIM product config | Approval |
|---|---|---|---|
| **Open / OFFICIAL, low-risk** | Reference Data (court houses, court schedule) | Subscription key only; **auto-approve** | None / instant |
| **OFFICIAL** | Most case/hearing APIs | Key **+ OAuth2 (Entra)**; publisher approval | API owner, within SLA |
| **OFFICIAL-SENSITIVE** | Prosecution Case Details, anything with personal data | Key **+ OAuth2 scoped**; **two-stage**: API owner **+ governance review**; DSA/DPA confirmed before issue | Owner + marketplace governance |

This makes the declaration checkboxes already in the form (`arD3` DSA/DPA, `arD4` Data Governance) enforceable gates rather than honour-system ticks.

---

## 6. Options compared (incl. the ones we discussed)

| Option | Fit for capture+approval | Data residency | Effort | Verdict |
|---|---|---|---|---|
| **APIM-native** (recommended target) | Excellent — the whole lifecycle is built-in | Azure UK region; OFFICIAL-ok under G-Cloud. ⚠️ Entra External ID is public-cloud-only — confirm | Medium-high (platform setup, real value) | **Target architecture** |
| **Power Platform** (Power Apps + Power Automate approvals + Dataverse) | Good for the *form + approval routing*; no gateway/credentials | Dataverse environments are **region-bound** (UK selectable) | Low — in-tenant, low-code, approvals built-in | **Recommended stopgap** while APIM is stood up |
| **Supabase** (earlier idea) | Good as a bespoke DB+auth | **SOC 2 Type 2 but no UK gov accreditation**; region-select only | Medium — but you'd rebuild what APIM/Entra give free | **Drop** — Azure Postgres + Entra supersede it |
| **Jira / JSM** (earlier idea) | Good queue/SLA/workflow; poor for credentials; external consumers need Atlassian access | **Atlassian Cloud UK data residency IS available** (Europe/London) | Low-medium | Viable interim tracker, but External-ID + APIM beat it for the real service |
| **Status quo** (`mailto:`) | None — lossy, no tracking | n/a | n/a | **Replace** |

**Net:** drop Supabase; APIM + Entra is the destination; Power Platform is the fastest credible bridge inside our tenant; JSM only if Power Platform is unavailable.

---

## 7. Phased delivery

### Phase 0 — Stop the bleeding (days, low-code) — *optional but recommended*
- Replace the `mailto:` handler with a **Power Apps form** (or Microsoft Forms) writing to **Dataverse** in a **UK-region** environment, with a **Power Automate approval flow** routing to the marketplace team and notifying the requester.
- Outcome: requests are captured, queued, tracked, and auditable **this sprint**, with no custom code and no data leaving the tenant.
- Decommission the fake `AR-2025-001` reference; use the Dataverse record ID.

### Phase 1 — Foundations (Azure landing zone)
- Stand up **APIM** (Developer tier for build), **Entra External ID** external tenant, **Static Web Apps**, **Azure Database for PostgreSQL** (UK South), **Key Vault**, **GOV.UK Notify** account (request service + templates).
- Onboard 1–2 low-risk **OFFICIAL** APIs as APIM **products** with auto-approval to prove the pipe.

### Phase 2 — Real access-request lifecycle
- Port the catalogue front-end to **Static Web Apps**; wire sign-in to **Entra / External ID**.
- Implement the **subscription request → publisher approval → key issuance** flow on APIM for OFFICIAL products.
- **Functions** capture approve/reject + notes into Postgres; **GOV.UK Notify** sends decision emails (`CAP-05-13`) and **SLA-breach reminders** (`CAP-06-07`).
- Migrate "request a new API" demand-signal form to Functions + Postgres + Notify.

### Phase 3 — Sensitive APIs & governance
- Add **OFFICIAL-SENSITIVE products** with OAuth2 + **two-stage approval** (owner + governance) and enforced DSA/DPA gate (§5).
- Add governance dashboards/reporting; wire SLA metrics.

### Phase 4 — Align with central GDS hub
- Engage the GDS API hub team (**via the Scrumconnect partnership**) to **federate HMCTS listings into the central catalogue** and adopt its quality/security scoring, avoiding divergence.

---

## 8. Decisions needed & open questions

**Decisions for the team:**
1. **Do Phase 0 (Power Platform stopgap) or wait for APIM?** Recommend yes — it's cheap and removes the lossy `mailto:` now.
2. **Confirm Entra External ID's public-cloud-only posture is acceptable** for OFFICIAL-SENSITIVE consumer-request data, or scope External ID to OFFICIAL only.
3. **Federate with the GDS central hub, or stay standalone?** (Strong reason to federate given the Scrumconnect link.)

**Open questions the research did not fully close (verify before build):**
- Companies House / DVLA / Ordnance Survey onboarding patterns (not verified this pass).
- GOV.UK Notify eligibility specifics + any OFFICIAL-SENSITIVE content constraints for *this* service.
- Definitive HMCTS data-residency ruling: Azure UK region vs External ID public cloud vs Atlassian UK vs Supabase.
- Power Platform approval-flow ceiling vs APIM-native for the two-stage sensitive path.

---

## Evidence base

Confidence reflects the research pass's adversarial verification (claims confirmed 3-0 = **High**; extracted from a primary source but not in the top-25 verified set = **Supporting**).

**High confidence (verified against primary sources):**
- HMRC self-service portal + 10-working-day production review + sandbox-first — developer.service.hmrc.gov.uk/api-documentation/docs/using-the-hub, /authorisation/credentials
- HMRC three access tiers (open / application-restricted / user-restricted) — /api-documentation/docs/authorisation
- NHS England multi-stage assurance + Connection Agreement — digital.nhs.uk/developer/guides-and-documentation/onboarding-process, /assurance/process-for-apis-and-services
- GOV.UK API Catalogue is discovery-only — api.gov.uk; github.com/co-cddo/api-catalogue
- GDS cross-gov API hub alpha (Nov 2025, with Scrumconnect) + signed-in portal MVP — dataingovernment.blog.gov.uk/2025/11/28/...
- APIM subscriptions / products / auto-or-publisher approval / key issuance — learn.microsoft.com/azure/api-management/api-management-subscriptions
- APIM OAuth2 + validate-jwt / validate-azure-ad-token at the gateway; subscription key ≠ strong auth — .../authentication-authorization-overview, /api-management-howto-protect-backend-with-aad, /validate-jwt-policy
- Entra External ID = next-gen CIAM, workforce vs external tenants, entitlement-management access requests — learn.microsoft.com/entra/external-id/external-identities-overview, /customers/faq-customers
- Azure AD B2C end-of-sale to new customers 1 May 2025; supported to ≥2030 — same sources
- Entra External ID public-cloud only (FedRAMP High / DoD IL2; not UK gov cloud) — /customers/faq-customers

**Supporting (primary source, not adversarially re-verified):**
- GOV.UK Notify = GDS email/SMS/letter product with public REST API — api.gov.uk/gds/gov-uk-notify
- Azure in-scope under UK G-Cloud for OFFICIAL data — learn.microsoft.com/compliance/regulatory/offering-g-cloud-uk
- UK GSCP tiers (OFFICIAL/SECRET/TOP SECRET); NCSC cloud asset-protection (know where data resides) — gov.uk/government/publications/government-security-classifications; ncsc.gov.uk cloud principle 2
- Azure Static Web Apps managed vs bring-your-own Functions — learn.microsoft.com/azure/static-web-apps/apis-functions
- Power Automate approvals stored in Dataverse; environments region-bound — learn.microsoft.com/power-automate/get-started-approvals; /power-platform/admin/regions-overview
- Supabase SOC 2 Type 2, no UK gov accreditation — supabase.com/docs/guides/security/soc-2-compliance
- Atlassian Cloud UK data residency (Europe/London) for Jira/JSM/Confluence — support.atlassian.com/.../understand-data-residency
- International: api.data.gov (shared key, API Umbrella), Singapore APEX, api.gov.au (standards/catalogue) — api.data.gov/about; developer.tech.gov.sg APEX; api.gov.au
