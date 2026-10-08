# Prerequisite: configure Entra External ID for the local app

The prototype's Entra flow (`/auth/entra`) lets a user **register and sign in** through a real
Microsoft Entra External ID tenant, then **register an application**, which gets them a real client ID
and secret. For this to work against the Kit on your machine, Entra has to trust the local app.

This page covers that one-off set-up. When it's done, carry on with step 4 of
[`INSTALLATION.md`](INSTALLATION.md).

> **Already set up?** The team's sandbox tenant, `hmctsextsbox.onmicrosoft.com`, may already have
> both app registrations below, with `http://localhost:3100/auth/callback` as a redirect URI. If so,
> you don't need to change anything in Entra. Ask the team for the values listed under
> [What to collect](#what-to-collect) and go to step 4 of [`INSTALLATION.md`](INSTALLATION.md).

## What you're setting up

| Registration | Used by | What it does | `.env` variables |
|---|---|---|---|
| **1. Sign-in app** | `/auth/entra` and `/auth/callback` | Sends users to Entra to sign up or sign in, then swaps the returned code for an ID token (OIDC authorization code flow, `openid profile email`) | `ENTRA_*` |
| **2. Onboarding app** | `/auth/register-app` | Calls Microsoft Graph with its own credentials to create the user's application, its service principal and a client secret | `ONBOARDING_*` |

Both registrations must be in the **same External ID tenant**. The onboarding app gets its Graph
token from the same `ENTRA_TOKEN_ENDPOINT` as sign-in.

## Before you start

- **A Microsoft Entra External ID tenant**: the *external* tenant configuration, not the
  workforce tenant. The prototype is built against `hmctsextsbox.onmicrosoft.com`. Don't use HMCTS's
  corporate tenant.
- **Roles in that tenant:**
  - **Application Administrator**: to create the registrations, secrets and user flow, and to grant
    consent for the sign-in permissions.
  - **Privileged Role Administrator or Global Administrator**: needed once, to grant admin consent for
    the onboarding app's Microsoft Graph *application* permission (step 3.3). If you don't hold it,
    ask someone who does.
- The **Microsoft Entra admin center**: <https://entra.microsoft.com>. Use the settings icon in the
  top bar to switch to the external tenant before every step.

Note the tenant's **Tenant ID** (a GUID) and **subdomain** (the part before `.onmicrosoft.com`,
for example `hmctsextsbox`). They're on the tenant's **Overview** page, and both go into the
endpoint URLs.

## 1. Register the sign-in app

### 1.1 Create the registration

1. Go to **Entra ID → App registrations → New registration**.
2. **Name:** something that says what it's for, such as `API Marketplace prototype - local`.
3. **Supported account types:** *Accounts in this organizational directory only*.
4. **Redirect URI:** platform **Web**, URI `http://localhost:3100/auth/callback`.

   Use exactly this address: the Kit always runs on port 3100, and the path is the route in
   `prototype-kit/app/routes.js`. Entra accepts plain `http` only for `localhost`.
5. Select **Register**. On the **Overview** page, copy the **Application (client) ID** into
   `ENTRA_CLIENT_ID`.

### 1.2 Create a client secret

1. **Certificates & secrets → Client secrets → New client secret**. Give it a description and the
   shortest expiry that suits you.
2. Copy the secret's **Value** straight away, into `ENTRA_CLIENT_SECRET`. Entra shows it only once;
   copy **Value**, not **Secret ID**.

### 1.3 API permissions

The app asks for `openid profile email`, which are delegated Microsoft Graph permissions.

1. **API permissions → Add a permission → Microsoft Graph → Delegated permissions**.
2. Tick **openid**, **profile** and **email**, then **Add permissions**.
3. Select **Grant admin consent for \<tenant\>** and confirm. The **Status** column should now show a
   green tick for each one.

Admin consent is required, not optional. Customers in an External ID tenant can't consent for
themselves, so without it sign-in fails with a consent error.

### 1.4 Return the email address in the ID token

The prototype reads the user's `email` claim from the ID token, and saves `(not returned)` if it's
missing.

1. **Token configuration → Add optional claim → ID**.
2. Tick **email**, then **Add**. If asked, also tick the option to turn on the Microsoft Graph
   **email** permission.

## 2. Let users register: the sign-up and sign-in user flow

Without a user flow linked to the app, Entra can sign existing users in but offers no way to create
an account.

1. Go to **Entra ID → External Identities → User flows → New user flow**.
2. **Name:** for example `signupsignin-marketplace`.
3. **Identity providers:** **Email with password**, or **Email one-time passcode** if you don't want
   users to choose a password.
4. **User attributes:** tick **Display Name**, so the ID token's `name` claim is filled in. Add
   others if you want them; the prototype doesn't use them.
5. Select **Create**.
6. Open the new user flow, go to **Applications → Add application**, select the sign-in app from
   step 1, then **Select**.

An app can be linked to only one user flow. If the sign-in app already belongs to another flow, that
flow is the one users will see.

## 3. Register the onboarding app

This app lets the prototype create an application in Entra for each user who registers one.

### 3.1 Create the registration

1. **App registrations → New registration**.
2. **Name:** for example `amp-client-onboarding-prototype`.
3. **Supported account types:** *Accounts in this organizational directory only*.
4. **Redirect URI:** leave it blank. This app never signs anyone in.
5. Select **Register**, then copy the **Application (client) ID** into `ONBOARDING_CLIENT_ID`.

### 3.2 Create a client secret

As in step 1.2. The **Value** goes into `ONBOARDING_CLIENT_SECRET`.

### 3.3 Grant the Microsoft Graph permission

The prototype calls `POST /applications`, `POST /servicePrincipals` and
`POST /applications/{id}/addPassword` as the app itself, with no user involved.

1. **API permissions → Add a permission → Microsoft Graph → Application permissions**.
2. Search for and tick **Application.ReadWrite.OwnedBy**, then **Add permissions**.
3. Select **Grant admin consent for \<tenant\>**. This needs Privileged Role Administrator or Global
   Administrator.

`Application.ReadWrite.OwnedBy` is the narrowest permission that works. The onboarding app can create
applications, and it becomes the owner of each one, so it can only manage the applications it
created. Don't use `Application.ReadWrite.All` instead: that would let it change every application
in the tenant.

You can remove the default delegated **User.Read** permission; this app doesn't use it.

## What to collect

| `.env` variable | Value |
|---|---|
| `ENTRA_CLIENT_ID` | Sign-in app's Application (client) ID (step 1.1) |
| `ENTRA_CLIENT_SECRET` | Sign-in app's secret value (step 1.2) |
| `ENTRA_REDIRECT_URI` | `http://localhost:3100/auth/callback` |
| `ENTRA_AUTHORIZE_ENDPOINT` | `https://<subdomain>.ciamlogin.com/<tenant-id>/oauth2/v2.0/authorize` |
| `ENTRA_TOKEN_ENDPOINT` | `https://<subdomain>.ciamlogin.com/<tenant-id>/oauth2/v2.0/token` |
| `ONBOARDING_CLIENT_ID` | Onboarding app's Application (client) ID (step 3.1) |
| `ONBOARDING_CLIENT_SECRET` | Onboarding app's secret value (step 3.2) |

You can check the two endpoint URLs on the sign-in app's **Overview → Endpoints** page. External ID
tenants use `ciamlogin.com`, not `login.microsoftonline.com`.

Keep the secrets out of git, chat and tickets. They go only into `prototype-kit/.env`, which git
ignores. See [`INSTALLATION.md`](INSTALLATION.md).

## When something goes wrong

| What you see | Likely cause |
|---|---|
| `AADSTS50011` (redirect URI mismatch) | `ENTRA_REDIRECT_URI` doesn't exactly match the URI from step 1.1. Check the port, the path and that it's `http`, not `https`. |
| `AADSTS7000215` (invalid client secret) | The **Secret ID** was copied instead of the **Value**, or the secret has expired. Create a new one. |
| `AADSTS65001` or a consent prompt nobody can accept | Admin consent wasn't granted in step 1.3. |
| Sign-in works but there's no "create one" link | The sign-in app isn't linked to the user flow (step 2.6). |
| Email shows as `(not returned)` | The optional `email` claim is missing (step 1.4). |
| Registering an application fails with `Authorization_RequestDenied` | `Application.ReadWrite.OwnedBy` hasn't had admin consent (step 3.3). It can also take a few minutes to take effect. |
| Entra signs you straight in without showing a form | Your browser already has an Entra session. Use a private window, or sign out of the tenant first. |
