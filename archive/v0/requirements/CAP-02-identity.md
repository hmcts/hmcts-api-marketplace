# CAP-02: User Registration & Identity Management — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP02-01 | A user shall be able to self-register with name, organisation, email, password and role | Consumer / Producer / Reviewer |
| REQ-CAP02-02 | Registration shall support Consumer, Producer and Reviewer role selection | All |
| REQ-CAP02-03 | A registered user shall be able to sign in with email and password | All |
| REQ-CAP02-04 | A signed-in user shall be routed to the appropriate dashboard based on their role | System |
| REQ-CAP02-05 | A user shall be able to update their profile (name, organisation) | All |
| REQ-CAP02-06 | A user shall be able to sign out | All |
| REQ-CAP02-07 | The system shall preserve session state across page navigation | System |
| REQ-CAP02-08 | Registration shall require email verification before account activation (production) | System |
| REQ-CAP02-09 | The system shall support password reset and account recovery (production) | All |
| REQ-CAP02-10 | Login shall be required only when a user attempts to perform an authenticated action | System |

---

## Prototype status

| Requirement | Status | Notes |
|---|---|---|
| REQ-CAP02-01 to 07 | ✅ Built | Using localStorage |
| REQ-CAP02-08 | ❌ Requires backend | Email verification needs Supabase auth |
| REQ-CAP02-09 | ❌ Requires backend | Password reset needs Supabase auth |
| REQ-CAP02-10 | ✅ Built | Auth overlay only shown when needed |
