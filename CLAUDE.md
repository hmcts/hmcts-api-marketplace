# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A clickable prototype of the **HMCTS API Marketplace** — a discovery, publication and access-management
platform for HMCTS APIs. It is a presentation/demo artefact, not a production service. The GitHub repo
is `hmcts/hmcts-api-marketplace` and the public site is served from GitHub Pages at
`https://hmcts.github.io/hmcts-api-marketplace/`.

The site is authored in the GOV.UK Prototype Kit under `prototype-kit/` and exported as static HTML
into `docs/`, which is the Pages publishing root. What used to be called "v2" is now simply the site:
it was promoted to the root in September 2026, and the two generations it replaced were moved out of
the publishing root into `archive/`.

The site is not backend-free. Sign-in, registration, account, My applications and the request forms
call an auth API at `https://hmcts-api-marketplace-auth-vu5d.onrender.com`, across
`/api/login`, `/api/logout`, `/api/register`, `/api/me`, `/api/applications` and `/api/requests`.
**That host was never sanctioned.** [ADR 0003](design/adr/0003-authentication-and-identity.md) says
authentication is to be faked client-side until a sanctioned identity solution exists, and each of the
calls above was added as an explicit, documented exception rather than a blanket reopening of the rule.
Treat that list as the extent of it: don't add a new backend call without the same explicit call-out,
and don't point anything at a different host.

## Where the code is

| | Location | State |
|---|---|---|
| **The site** | Author in `prototype-kit/app/views/**`; generated output lands in `docs/` | Live at the Pages root. GOV.UK Prototype Kit + `govuk-frontend`, bilingual (`cy/`). **Develop here.** |
| **v1, the superseded bespoke site** | `archive/v1` — 28 pages, shared `archive/v1/assets/{styles.css,scripts.js}` | Bespoke CSS, no GOV.UK Frontend. Kept for reference. CI blocks any change to its content. |
| **v0, the original prototype** | `archive/v0`, plus root-level copies `index.html`, `prototype/index.html`, `prototype/api-catalogue-v7.html` | Single-file prototypes, kept for reference. CI blocks any change to its content. |

Four of the v0 files are byte-identical to one another — `index.html`, `prototype/index.html`,
`prototype/api-catalogue-v7.html` and `archive/v0/login/index.html` are the same 320 KB file
(`archive/v0/index.html` is a different, earlier one). You should not normally be editing any of them.

`archive/` and `design/` both sit outside `docs/`, because `docs/` is the Pages publishing root and
anything in it is served publicly. **Don't add hand-written files to `docs/`** — see below.

## Working on the site

**Never hand-edit `docs/`.** It is generated output, committed only because GitHub Pages serves from
the repo. Edit the Prototype Kit source under `prototype-kit/app/`, then re-export. See
[`design/adr/0002-prototype-kit-with-static-export.md`](design/adr/0002-prototype-kit-with-static-export.md).

```bash
npm run kit      # GOV.UK Prototype Kit dev server on :3100, for authoring/preview
npm run export   # renders every route in scripts/routes.manifest.json into docs/
npm run gates    # manifest, translations, structure, html-validate, links, a11y (pa11y), reflow
```

`npm run export` needs the Kit running on :3100 — it fetches every route over HTTP from the live Kit.
The gates read the committed output in `docs/`, so they do **not** need the Kit; but on a branch where
you have edited `prototype-kit/` and not re-exported, they will happily pass against stale output and
tell you nothing about your change. Run `npm run export && npm run gates`.

CI (`.github/workflows/site.yml`) re-runs the export and fails the build if `docs/` drifts from a
fresh export. It also runs `npm run verify-gates`, a mutation harness that deliberately breaks the
thing each gate checks and asserts the gate fails — so a gate cannot be quietly weakened without its
proof failing too.

Source layout: pages in `prototype-kit/app/views/**` (Nunjucks + GOV.UK macros), routes and
template-wide values in `prototype-kit/app/routes.js`, English/Welsh strings in
`prototype-kit/app/locales/{en,cy}.json`. There are 46 declared routes. A new route must be added to
`scripts/routes.manifest.json` or the export gate fails the build (this is deliberate — see ADR 0002's
"why a manifest and not a crawler").

Multi-step journeys carry answers in `sessionStorage`, not server sessions — the Kit's server-side
form POSTs don't survive static export.

Two Nunjucks gotchas worth knowing:

- An arbitrary key added to `prototype-kit/app/config.json` or
  `prototype-kit/app/data/session-data-defaults.js` is **silently undefined** in a template. Values
  templates need — external URLs, for instance — go in `prototype-kit/app/routes.js` and are exposed
  through `localeLocals`, alongside `ampCatalogueUrl`.
- `{{ }}` is **not** interpolated inside a quoted string passed to a GOV.UK macro, such as the
  `html: '...'` parameter of `govukTabs`. Concatenate with `~` there, or the tag renders literally
  into the page.

## Build / run / test

The site has real tooling: `npm run kit`, `npm run export`, `npm run gates`, `npm run verify-gates`.
The archives have none of it — no build pipeline, no tests, no linter, just plain HTML.

To view the exported site without the Kit:

```bash
python3 -m http.server 8000 --directory docs        # then open http://localhost:8000/
```

To view an archived generation:

```bash
python3 -m http.server 8001 --directory archive/v1  # then open http://localhost:8001/
```

Use a server, not `file://`. Exported routes are directories containing `index.html`, and nothing maps
`get-started/` onto `index.html` over the file protocol, so links land on a folder listing. The
archived v1 pages additionally make cross-origin `fetch()` calls that fail from `file://`.

Node 20–24 (`package.json` engines); `.nvmrc` pins 24, which is what CI uses. The `prototype-kit/`
install is separate from the root one — `npm ci && (cd prototype-kit && npm ci)`.

## Architecture of the archived v1 site (`archive/v1`)

Plain multi-page static HTML. `archive/v1/assets/styles.css` (37 KB) is a bespoke design system; there
is no GOV.UK Frontend. `archive/v1/assets/scripts.js` provides the mobile nav toggle, catalogue
filtering, tab switching, mock form submission (`data-mock-submit` — forms show a confirmation and send
nothing), and a site-wide `/api/me` check that swaps the header "Sign in" link for the signed-in user's
name.

Header, navigation and both footer columns are **copy-pasted into all 28 pages**. A change to any of
them would be a 28-file edit. (The current site fixes this with one Nunjucks layout.)

Several journeys (create an application, register, the four content forms) are multiple screens inside
one HTML file, toggled by JavaScript via `display:none`. They have no per-step URLs, so
`my-applications.html` contains nine `<h1>` elements.

`archive/v1/api-catalogue.html` is a signpost to the external catalogue. `api-detail.html` and
`assets/api-data.js` are orphaned remnants of an earlier in-site catalogue — nothing links to them.
`my-applications.html` links to `entra-jwt-auth.html`, which has never existed in this repo.

## Architecture of the archived v0 prototype (`archive/v0`)

Vanilla-JS single-page app in one file, ES5-ish. "Pages" are sibling `<div id="...Page" class="app-page">`
elements shown via `show*()` functions. `var APIS = [...]` seeds ~6 APIs; `fetchLiveCatalogue()` overwrites
it from `https://hmcts.github.io/amp-catalog/apis.json`. State persists in `localStorage` under `_cat_*`
keys. Three roles — `consumer`, `producer`, `reviewer` — each with a dashboard.

## The API catalogue

The catalogue data lives **outside this repo**, at `https://hmcts.github.io/amp-catalog/`. The site's
own catalogue pages read it live — `docs/public/javascripts/api-catalogue.js` fetches
`amp-catalog/apis.json` and then each API's OpenAPI spec from `raw.githubusercontent.com`. See
[ADR 0005](design/adr/0005-in-repo-api-catalogue.md).

## Documentation

- **`design/`** — audit, design specs, ADRs and flow diagrams behind the rebuild. Start with
  [`design/README.md`](design/README.md). Read the audit
  ([`design/audit/2026-08-17-govuk-conformance-audit.md`](design/audit/2026-08-17-govuk-conformance-audit.md))
  before touching markup, and the ADRs (branding/domain, Kit + static export, auth/identity, hosting,
  in-repo catalogue) before touching structure or tooling.
- **`archive/v0/requirements/CAP-01..14-*.md`** — capability specs, with supporting
  `archive/v0/capabilities.md`, `roadmap.md`, `product-vision.md`, `user-journeys/` and
  `gap-analysis/`. Feature behaviour is often tagged with the capability it implements (e.g. comments
  referencing `CAP-03`).

## Things to know before changing anything

- **Edit `prototype-kit/app/`, never `docs/` directly.** It's generated output; CI fails the build if
  it drifts from a fresh `npm run export`.
- **Don't add hand-written files to `docs/`.** Anything there is published, and the export owns the
  directory. Design notes and diagrams go in `design/`.
- A new route must be added to `scripts/routes.manifest.json`, or the export gate fails the build —
  this is deliberate (ADR 0002), so that a broken or unlinked page fails loudly instead of silently
  vanishing.
- **The archives are immutable.** CI's "Guard the archives" step compares the blob hashes of every file
  under `archive/` (and the old `docs/v0`, `docs/v1` locations) between the base branch and the head,
  and fails if the multisets differ. Relocating an archived file passes; changing its content does not.
- `contact` is a no-op form, but `publish-api`, `request-api` and `request-new-api` really do submit:
  they POST to `/api/requests` on the auth backend (see
  `prototype-kit/app/assets/javascripts/requests.js`). Don't add copy to `contact` that implies a real
  submission.
- The site is bilingual: every route under `prototype-kit/app/views/` needs both `en` and `cy` strings
  in `prototype-kit/app/locales/`, checked by `npm run gate:translations`. Welsh copy must come from
  the HMCTS Welsh Language Unit — a null Welsh string falls back to English and is counted as
  untranslated rather than invented.
- Auth tokens are held in `localStorage` and sent as `Authorization: Bearer`. Note that
  `hmcts.github.io` is a **single origin shared with every other HMCTS Pages site**, so anything stored
  there is readable by all of them. Don't extend token storage on that origin.
- The brand blue `#0096d6` (archived v1 only) is 3.32:1 against white and fails WCAG AA. The current
  site uses GOV.UK Frontend colours; `npm run gate:structure` fails on the old value.
- "Accessibility statement", "Cookies" and "Privacy notice" are real pages on the current site
  (`accessibility-statement/`, `cookies/`, `privacy/`) — the first two are legally required. Keep them
  accurate as the site changes; `privacy/` and `cookies/` currently disagree with each other about
  whether sign-in exists.
