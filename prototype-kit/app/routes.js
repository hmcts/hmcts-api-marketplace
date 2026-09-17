//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const fs = require('fs')
const path = require('path')
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// The AMp API catalogue is a separate service, outside this site. Every link to
// it comes from here, so swapping in the final URL is a one-line change.
//
// This lives in routes.js rather than app/config.json because the Kit only
// exposes a fixed set of config keys (serviceName and friends) to templates -
// an arbitrary key added to config.json is silently undefined in a template,
// which is how the catalogue button ended up rendering as a dead <button> with
// no href. scripts/check-structure.mjs now fails on that.
const AMP_CATALOGUE_URL = 'https://hmcts.github.io/amp-catalog/'

// Requesting API access ("subscribe") and publishing an API are owned by the
// hosted marketplace web app on the Azure sandbox, not by this prototype.
// Every link to them comes from here, so swapping the final URLs is a two-line
// change.
//
// These are template locals rather than keys in app/config.json or
// app/data/session-data-defaults.js for the same reason as the catalogue URL
// above: an arbitrary key in either is silently undefined in a template.
const SANDBOX_WEB = 'https://apim-marketplace-web.sandbox.platform.hmcts.net'
const REQUEST_API_URL = `${SANDBOX_WEB}/subscribe`
const PUBLISH_API_URL = `${SANDBOX_WEB}/publish`

// ---------------------------------------------------------------- languages
//
// HMCTS runs courts and tribunals in England *and Wales*, so Welsh is a duty
// rather than a nice-to-have. English lives at /, Welsh at /cy/.
//
// One set of templates serves both. Strings come from app/locales/<locale>.json
// via t(). A Welsh string that is null falls back to English and is counted as
// untranslated by scripts/check-translations.mjs - nothing here invents Welsh
// copy, because machine-translated Welsh on a government service is worse than
// none. The words must come from the HMCTS Welsh Language Unit.

const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'cy']
const WELSH_PREFIX = '/cy'

const dictionaries = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', `${locale}.json`), 'utf8'))
  ])
)

function lookup (dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary)
}

// Returns the string for this locale, falling back to English when the
// translation does not exist yet. Never returns a key or an empty string:
// a page showing "nav.publish" to a user is worse than one showing English.
function translator (locale) {
  const t = (key) => {
    const value = lookup(dictionaries[locale], key)
    if (typeof value === 'string' && value.length) return value
    const fallback = lookup(dictionaries[DEFAULT_LOCALE], key)
    if (typeof fallback === 'string' && fallback.length) return fallback
    throw new Error(`Missing string "${key}" in both ${locale} and ${DEFAULT_LOCALE} locales`)
  }
  // Lets a template mark English-in-a-Welsh-page with lang="en", which is both
  // honest and correct under WCAG 3.1.2 Language of Parts.
  t.isTranslated = (key) => {
    const value = lookup(dictionaries[locale], key)
    return typeof value === 'string' && value.length > 0
  }
  return t
}

function localeLocals (locale, currentPath) {
  return {
    // Path with no locale prefix, so the language toggle can point at the same
    // page in the other language.
    currentPath: currentPath,
    locale,
    htmlLang: locale,
    isWelsh: locale === 'cy',
    localeRoot: locale === 'cy' ? WELSH_PREFIX : '',
    otherLocale: locale === 'cy' ? 'en' : 'cy',
    t: translator(locale),
    ampCatalogueUrl: AMP_CATALOGUE_URL,
    requestApiUrl: REQUEST_API_URL,
    publishApiUrl: PUBLISH_API_URL
  }
}

// Templates hardcode English paths such as href="/publish". On a Welsh page
// those must point at /cy/publish. Rewriting the rendered HTML in one place
// beats threading a url() helper through every href in every template, and
// means a new page is bilingual without its author doing anything.
//
// Asset roots and external links are left alone, and so is the language toggle
// itself - rel="alternate" marks the one link that must escape the current
// language, and rewriting it would make the toggle point back at Welsh.
function localiseLinks (html) {
  return html.replace(/<a\b[^>]*>/g, (tag) => {
    if (/rel="alternate"/.test(tag)) return tag
    return tag.replace(/\bhref="(\/[^"]*)"/, (whole, target) => {
      if (target.startsWith('//')) return whole
      if (target.startsWith('/plugin-assets/') || target.startsWith('/public/')) return whole
      if (target === WELSH_PREFIX || target.startsWith(`${WELSH_PREFIX}/`)) return whole
      return `href="${WELSH_PREFIX}${target === '/' ? '/' : target}"`
    })
  })
}

// Mirrors how the Kit resolves a URL to a view, so /cy/<path> renders the same
// template as /<path>.
function viewFor (urlPath) {
  const clean = (urlPath || '').replace(/^\/|\/$/g, '')
  if (!clean) return 'index'
  const candidates = [`${clean}.html`, path.join(clean, 'index.html')]
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(__dirname, 'views', candidate))) {
      return candidate.replace(/\.html$/, '')
    }
  }
  return null
}

// English pages: just the locale locals.
router.use((req, res, next) => {
  if (req.path === WELSH_PREFIX || req.path.startsWith(`${WELSH_PREFIX}/`)) return next()
  Object.assign(res.locals, localeLocals(DEFAULT_LOCALE, req.path.replace(/^\//, '')))
  next()
})

// Welsh pages: same view, Welsh locals, links rewritten to stay in Welsh.
router.get(new RegExp(`^${WELSH_PREFIX}(/.*)?$`), (req, res, next) => {
  const view = viewFor(req.params[0])
  if (!view) return next()

  res.render(view, localeLocals('cy', (req.params[0] || '').replace(/^\//, '')), (err, html) => {
    if (err) return next(err)
    res.send(localiseLinks(html))
  })
})

// ------------------------------------------------------ Entra sign-in prototype
//
// Prototype only: redirects to the real Entra External ID tenant
// (hmctsextsbox.onmicrosoft.com) to sign up/sign in, instead of the
// email+password form auth.js posts to the onrender backend. Configured
// entirely from prototype-kit/.env (ENTRA_*, gitignored - see that file).
//
// This is a parallel path at /auth/entra, kept deliberately separate from
// /sign-in, /register and /account so the working real flow is untouched and
// the two can be compared side by side.
const crypto = require('crypto')
const { Pool } = require('pg')

// Local Postgres (see db/schema.sql) - the piece Entra itself has no concept
// of: organisation, role, team membership, which application belongs to
// whom. Entra only ever knows oid/name/email; everything else lives here,
// keyed by oid, exactly as the design doc describes.
const db = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null

async function upsertProfile (oid, name, email) {
  if (!db) return
  await db.query(
    `insert into profiles (oid, name, email) values ($1, $2, $3)
     on conflict (oid) do update set name = excluded.name, email = excluded.email`,
    [oid, name || '(not returned)', email || '(not returned)']
  )
}

async function insertApplication (oid, name, environment, clientId) {
  if (!db) return null
  const { rows } = await db.query(
    'insert into applications (name, environment, owner_oid, client_id) values ($1, $2, $3, $4) returning id',
    [name, environment, oid, clientId]
  )
  return rows[0].id
}

async function getApplicationsFor (oid) {
  if (!db) return []
  const { rows } = await db.query(
    'select id, name, environment, client_id, created_at from applications where owner_oid = $1 order by created_at desc',
    [oid]
  )
  return rows.map((row) => ({
    ...row,
    created_at: row.created_at.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }))
}

// One row per (application, API) pair - see the conversation this was
// designed in: one Client ID/Secret per application, but a SEPARATE
// Subscription Key per API it calls. publisher_id is the APIM Product id and
// is expected to repeat across different applications subscribed to the same
// API in the same environment - only subscription_key is unique per pair.
async function insertApiSubscription (applicationId, apiName, publisherId, subscriptionKey, isMock) {
  if (!db) return
  await db.query(
    'insert into api_subscriptions (application_id, api_name, publisher_id, subscription_key, is_mock) values ($1, $2, $3, $4, $5)',
    [applicationId, apiName, publisherId, subscriptionKey, isMock]
  )
}

async function getApiSubscriptionsFor (applicationIds) {
  if (!db || !applicationIds.length) return []
  const { rows } = await db.query(
    'select application_id, api_name, publisher_id, subscription_key, is_mock from api_subscriptions where application_id = any($1) order by created_at',
    [applicationIds]
  )
  return rows
}

const ENTRA_CLIENT_ID = process.env.ENTRA_CLIENT_ID
const ENTRA_CLIENT_SECRET = process.env.ENTRA_CLIENT_SECRET
const ENTRA_REDIRECT_URI = process.env.ENTRA_REDIRECT_URI
const ENTRA_AUTHORIZE_ENDPOINT = process.env.ENTRA_AUTHORIZE_ENDPOINT
const ENTRA_TOKEN_ENDPOINT = process.env.ENTRA_TOKEN_ENDPOINT

router.get('/auth/entra', (req, res) => {
  if (!ENTRA_CLIENT_ID) {
    return res.status(500).send('Entra prototype is not configured - see prototype-kit/.env (ENTRA_CLIENT_ID etc.)')
  }
  // CSRF protection for the redirect round-trip: a value only this server
  // and Entra ever see, checked again when the browser comes back.
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('entra_state', state, { httpOnly: true, sameSite: 'lax' })

  const url = new URL(ENTRA_AUTHORIZE_ENDPOINT)
  url.searchParams.set('client_id', ENTRA_CLIENT_ID)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', ENTRA_REDIRECT_URI)
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  res.redirect(url.toString())
})

router.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query

  if (error) {
    return res.status(400).render('auth/error', { message: `Entra returned an error: ${error}`, detail: errorDescription })
  }
  if (!state || state !== req.cookies.entra_state) {
    return res.status(400).render('auth/error', { message: 'State mismatch - possible CSRF, or an expired/replayed link.' })
  }
  res.clearCookie('entra_state')

  let tokenBody
  try {
    const tokenRes = await fetch(ENTRA_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: ENTRA_CLIENT_ID,
        client_secret: ENTRA_CLIENT_SECRET,
        code,
        redirect_uri: ENTRA_REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'openid profile email'
      })
    })
    tokenBody = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(JSON.stringify(tokenBody))
  } catch (err) {
    return res.status(502).render('auth/error', { message: 'Token exchange with Entra failed.', detail: err.message })
  }

  // Prototype only: decodes the ID token to show its claims without verifying
  // the signature. A real integration must verify against Entra's JWKS
  // (see the issuer's /discovery/v2.0/keys) before trusting any claim -
  // skipped here because this path only ever talks to the token endpoint
  // directly over TLS, authenticated with our own client secret.
  const payload = JSON.parse(Buffer.from(tokenBody.id_token.split('.')[1], 'base64url').toString('utf8'))

  const email = payload.email || (payload.emails && payload.emails[0])

  // This is the write the earlier sequence diagram showed as broken (✕) -
  // the piece Entra itself has no concept of. Keyed by oid, same as the
  // design doc: no password or credential in this row, just profile data.
  await upsertProfile(payload.oid, payload.name, email)

  const params = new URLSearchParams({ oid: payload.oid })
  if (payload.name) params.set('name', payload.name)
  if (email) params.set('email', email)
  res.redirect(`/auth/signed-in?${params.toString()}`)
})

router.get('/auth/signed-in', async (req, res) => {
  if (!req.query.oid) return res.redirect('/auth/entra')
  const applications = await getApplicationsFor(req.query.oid)
  const subscriptions = await getApiSubscriptionsFor(applications.map((a) => a.id))
  const applicationsWithSubs = applications.map((app) => ({
    ...app,
    subscriptions: subscriptions.filter((s) => s.application_id === app.id)
  }))
  res.render('auth/signed-in', { oid: req.query.oid, name: req.query.name, email: req.query.email, applications: applicationsWithSubs })
})

// ------------------------------------------------- Client-onboarding prototype
//
// Prototype only: mirrors what hmcts/external-entra-id PR #7's
// amp-client-onboarding service principal is for (Application.ReadWrite.OwnedBy
// against Microsoft Graph) - but via a separate, throwaway app registration
// (amp-client-onboarding-prototype), not the real governed one. That one's
// secret lives in a Key Vault this environment doesn't have access to; this
// throwaway app does the identical Graph calls so the flow can be proven now.
// Swap ONBOARDING_CLIENT_ID/SECRET for the real service principal's once
// access is sorted - the Graph calls below don't change.
const ONBOARDING_CLIENT_ID = process.env.ONBOARDING_CLIENT_ID
const ONBOARDING_CLIENT_SECRET = process.env.ONBOARDING_CLIENT_SECRET

async function getOnboardingToken () {
  const res = await fetch(ENTRA_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: ONBOARDING_CLIENT_ID,
      client_secret: ONBOARDING_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    })
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`token request failed: ${JSON.stringify(body)}`)
  return body.access_token
}

async function graphRequest (accessToken, method, path, body) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const responseBody = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} failed: ${JSON.stringify(responseBody)}`)
  return responseBody
}

// Graph replication lag: an object created a moment ago isn't always visible
// yet to the next call that references it (seen on both /servicePrincipals
// and .../addPassword straight after /applications). Retry with backoff
// rather than fail a real, valid request on a timing race.
async function graphRequestWithRetry (accessToken, method, path, body, attempts = 5) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await graphRequest(accessToken, method, path, body)
    } catch (err) {
      if (attempt >= attempts || !/RequestDenied|does not exist|not found/i.test(err.message)) throw err
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }
}

// --------------------------------------------------- APIM subscription keys
//
// One Client ID/Secret per application (created via Graph above), but a
// SEPARATE Subscription Key per API that application calls - see the
// conversation this was designed in. publisher_id is the APIM Product id:
// fixed per (API, environment), and expected to repeat across different
// applications that subscribe to the same API - only the key is unique per
// (application, API) pair.
//
// These are the real Products on the real sandbox instance found and read
// during this session (sps-api-mgmt-sbox, resource group rg-sps-platform-sbox,
// subscription bd2864ed-4f3e-45ed-9c6a-8d179674bab1 - HMCTS's main corporate
// Azure tenant, not the hmctsextsbox CIAM tenant Entra/Graph calls use above).
const AVAILABLE_APIS = [
  { id: 'cp-crime-defendant-details', name: 'Crime Defendant Details API' },
  { id: 'cp-crime-hearing-results', name: 'Crime Hearing Results API' },
  { id: 'cp-crime-prosecution-case-details', name: 'Crime Prosecution Case Details API' },
  { id: 'cp-crime-results-pcr', name: 'Crime Case Prison Court Register API' },
  { id: 'cp-crime-schedulingandlisting', name: 'Court Listings and Scheduling API' },
  { id: 'cp-refdata-courthearing', name: 'Court and Tribunal Reference Data API' },
  { id: 'example-product', name: 'Example API (test / demo)' }
]

function apiCheckboxItems (selected) {
  return AVAILABLE_APIS.map((api) => ({
    value: api.id,
    text: api.name,
    checked: selected.includes(api.id)
  }))
}

function apiDetails (selected) {
  return selected.map((id) => AVAILABLE_APIS.find((a) => a.id === id) || { id, name: id })
}

// Real ARM credential for sps-api-mgmt-sbox: NOT provisioned. Creating an app
// registration for this needs Application Administrator rights in HMCTS's
// corporate Azure tenant, which this session does not have (unlike the
// hmctsextsbox CIAM tenant, where it's Global Administrator) - see the
// conversation this was raised in. Manually proven working via `az rest`
// directly (a real subscription + key were created and read back), but the
// code below has no credential of its own yet, so it mock-generates a key
// instead of calling ARM, clearly marked via is_mock so nothing pretends
// this is real. Swap in APIM_CLIENT_ID/SECRET once that credential exists -
// nothing else about this function needs to change.
const APIM_CLIENT_ID = process.env.APIM_CLIENT_ID
const APIM_CLIENT_SECRET = process.env.APIM_CLIENT_SECRET
const APIM_TENANT_ID = process.env.APIM_TENANT_ID || '531ff96d-0ae9-462a-8d2d-bec7c0b42082'
const APIM_SUBSCRIPTION_ID = process.env.APIM_SUBSCRIPTION_ID || 'bd2864ed-4f3e-45ed-9c6a-8d179674bab1'
const APIM_RESOURCE_GROUP = process.env.APIM_RESOURCE_GROUP || 'rg-sps-platform-sbox'
const APIM_SERVICE_NAME = process.env.APIM_SERVICE_NAME || 'sps-api-mgmt-sbox'

async function getApimToken () {
  const res = await fetch(`https://login.microsoftonline.com/${APIM_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: APIM_CLIENT_ID,
      client_secret: APIM_CLIENT_SECRET,
      scope: 'https://management.azure.com/.default',
      grant_type: 'client_credentials'
    })
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`APIM token request failed: ${JSON.stringify(body)}`)
  return body.access_token
}

async function createApimSubscription (productId, ownerLabel) {
  if (!APIM_CLIENT_ID) {
    return { subscriptionKey: `mock_${crypto.randomBytes(16).toString('hex')}`, isMock: true }
  }
  const token = await getApimToken()
  const subId = `${ownerLabel}-${productId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80)
  const base = `https://management.azure.com/subscriptions/${APIM_SUBSCRIPTION_ID}/resourceGroups/${APIM_RESOURCE_GROUP}/providers/Microsoft.ApiManagement/service/${APIM_SERVICE_NAME}`
  const res = await fetch(`${base}/subscriptions/${subId}?api-version=2022-08-01`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { scope: `${base}/products/${productId}`, displayName: subId }
    })
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`APIM subscription create failed: ${JSON.stringify(body)}`)
  return { subscriptionKey: body.properties.primaryKey, isMock: false }
}

// Mirrors the real four-screen wizard at account/applications/new/* (intro,
// details, check-answers, confirmation) so this prototype's screens look and
// read exactly like the real journey - just gated on the Entra oid carried
// through each step's query string / hidden fields, instead of the real
// wizard's sessionStorage data-journey engine and onrender-token session.
router.get('/auth/register-app', (req, res) => {
  if (!req.query.oid) return res.redirect('/auth/entra')
  res.render('auth/register-app/index', { oid: req.query.oid })
})

router.get('/auth/register-app/details', (req, res) => {
  if (!req.query.oid) return res.redirect('/auth/entra')
  res.render('auth/register-app/details', { oid: req.query.oid, appName: '' })
})

router.post('/auth/register-app/details', (req, res) => {
  const { oid, environment, owner, 'app-name': appName } = req.body
  if (!appName || !appName.trim()) {
    return res.status(400).render('auth/register-app/details', {
      oid, appName, error: 'Enter an application name'
    })
  }
  res.render('auth/register-app/select-apis', {
    oid, environment, owner, appName: appName.trim(),
    apiItems: apiCheckboxItems([])
  })
})

router.post('/auth/register-app/select-apis', (req, res) => {
  const { oid, environment, owner, 'app-name': appName } = req.body
  let selected = req.body.apis || []
  if (!Array.isArray(selected)) selected = [selected]
  if (!selected.length) {
    return res.status(400).render('auth/register-app/select-apis', {
      oid, environment, owner, appName, apiItems: apiCheckboxItems(selected),
      error: 'Select at least one API'
    })
  }
  res.render('auth/register-app/check-answers', {
    oid, environment, owner, appName, selectedApis: selected, selectedApiDetails: apiDetails(selected)
  })
})

router.post('/auth/register-app/check-answers', async (req, res) => {
  const { oid, environment, owner, 'app-name': appName } = req.body
  let selectedApis = req.body.apis || []
  if (!Array.isArray(selectedApis)) selectedApis = [selectedApis]
  if (!ONBOARDING_CLIENT_ID) {
    return res.status(500).render('auth/error', { message: 'Client-onboarding prototype is not configured - see prototype-kit/.env (ONBOARDING_CLIENT_ID etc.)' })
  }

  try {
    const accessToken = await getOnboardingToken()

    // Real Graph API calls - the same three steps described in the
    // amp-client-onboarding PR: create the app, create its service
    // principal, issue a secret. See the block comment above
    // ONBOARDING_CLIENT_ID for why this uses a throwaway identity.
    // This is the ONE Client ID/Secret for the whole application, however
    // many APIs it ends up subscribed to below.
    const app = await graphRequest(accessToken, 'POST', '/applications', {
      displayName: `${appName} (${environment}, ${oid.slice(0, 8)})`
    })
    await graphRequestWithRetry(accessToken, 'POST', '/servicePrincipals', { appId: app.appId })
    const passwordResult = await graphRequestWithRetry(accessToken, 'POST', `/applications/${app.id}/addPassword`, {
      passwordCredential: { displayName: 'prototype' }
    })

    // The other write the sequence diagram showed as broken (✕) - the
    // application record itself, linking the real Entra Client ID back to
    // this developer's profile. The secret is never stored here - shown
    // once, same as Entra's own behaviour.
    const applicationId = await insertApplication(oid, appName, environment, app.appId)

    // One Subscription Key PER API, against the real APIM Products found on
    // sps-api-mgmt-sbox - see the block comment above AVAILABLE_APIS for why
    // this mock-generates a key rather than calling ARM for real right now.
    const ownerLabel = `${appName}-${oid.slice(0, 8)}`
    const subscriptions = []
    for (const apiId of selectedApis) {
      const apiMeta = AVAILABLE_APIS.find((a) => a.id === apiId) || { id: apiId, name: apiId }
      const { subscriptionKey, isMock } = await createApimSubscription(apiId, ownerLabel)
      await insertApiSubscription(applicationId, apiMeta.id, apiId, subscriptionKey, isMock)
      subscriptions.push({ apiName: apiMeta.name, publisherId: apiId, subscriptionKey, isMock })
    }

    res.render('auth/register-app/confirmation', {
      oid,
      appName,
      clientId: app.appId,
      clientSecret: passwordResult.secretText,
      subscriptions
    })
  } catch (err) {
    console.error('register-app failed:', err.message)
    res.status(502).render('auth/register-app/check-answers', {
      oid, environment, owner, appName, selectedApis, selectedApiDetails: apiDetails(selectedApis),
      error: 'Something went wrong creating the application. Please try again.'
    })
  }
})

module.exports = router
