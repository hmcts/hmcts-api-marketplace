# Running the HMCTS API Marketplace locally

The site is a GOV.UK Prototype Kit app in `prototype-kit/`, exported as static HTML into `docs/`,
which GitHub Pages serves. Older generations of the site are kept, read-only, in `archive/`.

## 1. Install

If you haven't set up yet, follow [`INSTALLATION.md`](INSTALLATION.md) first. It covers the tools to
install, both `npm ci` installs and the optional Entra and database set-up.

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

`docs/` is generated output and CI fails a PR whose `docs/` doesn't match a fresh export, so
re-export before you commit any change under `prototype-kit/`. Keep `npm run kit` running, and in a
second terminal run:

```bash
npm run export   # render every route in scripts/routes.manifest.json into docs/
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
replacing it. It only runs under `npm run kit`, because the static export can't run server code. It
is configured through `prototype-kit/.env`: see step 4 of [`INSTALLATION.md`](INSTALLATION.md),
and [`ENTRA-PREREQUISITES.md`](ENTRA-PREREQUISITES.md) for the Entra side. The design is in
[`design/specs/2026-09-11-consumer-producer-detailed-design.md`](design/specs/2026-09-11-consumer-producer-detailed-design.md).

## Previewing the exported site

To see `docs/` the way GitHub Pages serves it, without the Kit, serve the folder over HTTP. Opening
the files directly doesn't work, because the pages make cross-origin requests that fail from
`file://`.

```bash
python3 -m http.server 8000 --directory docs
```

Then open <http://localhost:8000/>. Don't edit anything in `docs/` by hand; change the Kit source and
re-export. Don't change `archive/` either: CI fails any PR that alters its contents.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run kit` hangs at a port prompt | Something else is using port 3100. Stop that process. |
| `npm run export` fails to connect | The Kit isn't running. Start `npm run kit` first. |
| A11y or reflow gate: "Set CHROME_PATH, or install Chrome/Chromium" | Install Chrome or set `CHROME_PATH`. |
| CI says `docs/` differs from a fresh export | Run `npm run export` with the Kit running and commit the result. |
| Sign-in is slow the first time | The `onrender.com` backend is starting up. Wait, or use a local backend (see above). |
| `/auth/entra` says "Entra prototype is not configured" | Create `prototype-kit/.env` and restart the Kit. See step 4 of [`INSTALLATION.md`](INSTALLATION.md). |
| "localhost refused to connect" after signing in at Entra | The Kit crashed or isn't running. If its terminal shows `ECONNREFUSED ... 5432`, `DATABASE_URL` is set but Postgres isn't running. See step 4.2 of [`INSTALLATION.md`](INSTALLATION.md). |
