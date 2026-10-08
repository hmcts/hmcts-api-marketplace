# Running the HMCTS API Marketplace locally

This repo holds three versions of the site (see [`CLAUDE.md`](CLAUDE.md)). This guide covers the one
under active development, **v2**: a GOV.UK Prototype Kit app in `prototype-kit/` that is exported as
static HTML into `docs/v2/`. A short section at the end covers viewing the frozen live site.

## 1. Install

| Tool | Version | Needed for |
|---|---|---|
| [Node.js](https://nodejs.org/) | 24 (pinned in [`.nvmrc`](.nvmrc); `package.json` accepts 20–24) | Everything |
| npm | ships with Node | Everything |
| Google Chrome or Chromium | any recent | The accessibility and reflow gates only |
| PostgreSQL | 13 or newer | Optional: only the Entra sign-in prototype at `/auth/entra` |

If you use [nvm](https://github.com/nvm-sh/nvm), `nvm install && nvm use` picks up the right Node version.

There are **two** `package.json` files and both need installing: the root one holds the export and
gate tooling, `prototype-kit/` holds the Kit itself.

```bash
npm ci
(cd prototype-kit && npm ci)
```

Puppeteer is configured not to download its own Chromium (see [`.puppeteerrc.cjs`](.puppeteerrc.cjs)),
and `prototype-kit/.npmrc` sets `ignore-scripts=true`, so neither install runs package install scripts.

## 2. Run the prototype

```bash
npm run kit
```

Open <http://localhost:3100>. Welsh pages are under <http://localhost:3100/cy/>. The Kit reloads as
you edit files under `prototype-kit/app/`.

Port 3100 is pinned on purpose. If something else is already using it, stop that process. Don't
change the port: the Kit asks interactively for another port and hangs when it can't get an answer,
and the export script expects 3100.

That is all you need to browse the site. Sign-in, register, My applications and My requests call the
shared auth backend on `onrender.com` by default. It is a free-tier host, so the first request after a
quiet period can take up to a minute while it starts.

## 3. Export and run the gates

`docs/v2/` is generated output and CI fails a PR whose `docs/v2/` doesn't match a fresh export, so
re-export before you commit any change under `prototype-kit/`. Keep `npm run kit` running, and in a
second terminal run:

```bash
npm run export   # render every route in scripts/routes.manifest.json into docs/v2/
npm run gates    # manifest, translations, structure, html-validate, links, a11y, reflow
```

A new page has to be added to [`scripts/routes.manifest.json`](scripts/routes.manifest.json), with
strings in both `prototype-kit/app/locales/en.json` and `cy.json`, or the gates fail.

The accessibility and reflow gates drive a real Chrome. They look in the usual macOS and Linux install
locations; if yours is somewhere else, set `CHROME_PATH`:

```bash
CHROME_PATH="/path/to/chrome" npm run gates
```

More on the gates and what each one checks: [`scripts/README.md`](scripts/README.md).

## 4. Configuration

Nothing needs configuring to run the site. The settings below are only for the optional pieces.

### Environment variables for the gate scripts

All have working defaults.

| Variable | Default | Purpose |
|---|---|---|
| `CHROME_PATH` | auto-detected | Chrome used by the a11y and reflow gates |
| `EXPORT_BASE_URL` | `http://localhost:3100` | Where the export reads the running Kit from |
| `EXPORT_OUT` | `docs` | Where the export writes, and where the gates read from |
| `A11Y_PORT` / `REFLOW_PORT` | `8149` / `8153` | Ports the a11y and reflow gates serve the export on |

### Pointing the site at a local backend

To use a backend on your own machine instead of the `onrender.com` one (for example the stack in the
`service-api-marketplace` repo's `demo/` folder), run this in the browser console on the site:

```js
localStorage.setItem('hmctsMarketplaceApiBase', 'http://localhost:8080')
```

Change the port to match your backend. Only `http://localhost:<port>` and `http://127.0.0.1:<port>`
are accepted; any other value is ignored. To go back to the default:

```js
localStorage.removeItem('hmctsMarketplaceApiBase')
```

### Entra External ID sign-in prototype (`/auth/entra`)

This is a separate, server-side prototype inside the Kit, alongside the normal sign-in rather than
replacing it. It sends you to a real Entra External ID tenant, registers an application through
Microsoft Graph and issues APIM subscription keys. It only runs under `npm run kit`; the static export
can't run server code. The design is in
[`design/specs/2026-09-11-consumer-producer-detailed-design.md`](design/specs/2026-09-11-consumer-producer-detailed-design.md).

It reads its settings from `prototype-kit/.env`, which the Kit loads on start and git ignores. **Never
commit this file.** Ask the team for the values.

```dotenv
# Entra External ID sign-in (required for /auth/entra)
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_REDIRECT_URI=http://localhost:3100/auth/callback
ENTRA_AUTHORIZE_ENDPOINT=
ENTRA_TOKEN_ENDPOINT=

# App registration through Microsoft Graph (the "register an application" step)
ONBOARDING_CLIENT_ID=
ONBOARDING_CLIENT_SECRET=

# Local Postgres. Optional: without it, nothing is saved and no applications are listed
DATABASE_URL=postgres://localhost:5432/api_marketplace

# APIM subscription keys. Optional: without APIM_CLIENT_ID a key starting "mock_" is generated
APIM_CLIENT_ID=
APIM_CLIENT_SECRET=
# APIM_TENANT_ID, APIM_SUBSCRIPTION_ID, APIM_RESOURCE_GROUP and APIM_SERVICE_NAME
# default to the sps-api-mgmt-sbox sandbox instance
```

`ENTRA_REDIRECT_URI` has to be registered as a redirect URI on the Entra app registration.

To create the database:

```bash
createdb api_marketplace
psql api_marketplace -f prototype-kit/db/schema.sql
```

Restart `npm run kit` after changing `.env`.

## Viewing the live site (frozen)

The site at the GitHub Pages root (`docs/*.html`) is plain HTML with no build step. Serve the folder
over HTTP rather than opening the files directly, because the pages make cross-origin requests that
don't work from `file://`:

```bash
python3 -m http.server 8000 --directory docs
```

Then open <http://localhost:8000/>. Don't edit these pages. They are frozen until v2 replaces them,
and CI blocks PRs that change them.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run kit` hangs at a port prompt | Something else is using port 3100. Stop that process. |
| `npm run export` fails to connect | The Kit isn't running. Start `npm run kit` first. |
| A11y or reflow gate: "Set CHROME_PATH, or install Chrome/Chromium" | Install Chrome or set `CHROME_PATH`. |
| CI says `docs/` differs from a fresh export | Run `npm run export` with the Kit running and commit the result. |
| Sign-in is slow the first time | The `onrender.com` backend is starting up. Wait, or use a local backend (see above). |
| `/auth/entra` says "Entra prototype is not configured" | Create `prototype-kit/.env` (see above). |
