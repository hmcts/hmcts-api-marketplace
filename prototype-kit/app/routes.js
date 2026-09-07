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

module.exports = router
