// Link integrity gate, in two parts.
//
// 1. No broken internal links. Checked directly against every exported page,
//    not just whatever is reachable from the homepage - otherwise an
//    unreachable page's broken links go unchecked.
//
// 2. No unreachable pages. Every route must be reachable by following links
//    from the homepage. This is audit finding H-3 as a gate: the current site
//    carries an orphan page (api-detail.html, zero inbound links) precisely
//    because nothing ever checked.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep, posix } from 'node:path'
import { loadManifest } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs'

// Reachable by URL, never by link: the 404 page, and every redirect stub - the
// whole point of a stub is that an old external link or bookmark lands on it.
//
// The API catalogue detail page is reachable too, just not by a static <a>
// this crawler can see. Its links are built by client-side JS once the live
// amp-catalog feed loads (see design/adr/0005-in-repo-api-catalogue.md) - one
// shared route for every API, deliberately, rather than a manifest entry per
// live API that would go stale the moment the feed changes.
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
// /account is the same shape again: the service navigation's "Sign in" link
// only becomes an "/account" link via client-side JS, once a token is present
// (see app/assets/javascripts/auth.js) - there is no static <a href="/account">
// anywhere for a signed-out crawler to find.
// The whole account/applications/** tree hangs off account/index.html -
// since that page is itself only reachable by client-side JS (above), the
// crawler never visits it and so never discovers its outbound links either,
// even though account/index.html does link to it for real. My requests used
// to be its own page with the same problem, but now lives as a tab on
// account/index.html itself, so it needs no entry of its own here.
//
// The three request confirmation pages are a different shape of the same
// problem: check-answers no longer advances to them via a static data-next
// attribute (see requests.js) because advancing is now conditional on a real
// POST to /api/requests succeeding, not an unconditional next step - so
// there is no declarative edge for this crawler to follow either, only a
// client-side redirect once the request has actually been created.
const ALLOW_UNREACHABLE = new Set([
  '404.html',
  ...redirects.map((r) => r.from),
  'api-catalogue/detail/index.html',
  'cy/api-catalogue/detail/index.html',
  'account/index.html',
  'cy/account/index.html',
  'account/applications/index.html',
  'cy/account/applications/index.html',
  'account/applications/new/index.html',
  'cy/account/applications/new/index.html',
  'account/applications/new/check-answers/index.html',
  'cy/account/applications/new/check-answers/index.html',
  'account/applications/new/confirmation/index.html',
  'cy/account/applications/new/confirmation/index.html',
  'account/applications/detail/index.html',
  'cy/account/applications/detail/index.html',
  'account/applications/client-secrets/index.html',
  'cy/account/applications/client-secrets/index.html',
  'account/applications/client-secrets/confirmation/index.html',
  'cy/account/applications/client-secrets/confirmation/index.html',
  'account/applications/team-members/index.html',
  'cy/account/applications/team-members/index.html',
  'account/applications/team-members/add/index.html',
  'cy/account/applications/team-members/add/index.html',
  'account/applications/delete/index.html',
  'cy/account/applications/delete/index.html',
  'get-started/request-api/confirmation/index.html',
  'cy/get-started/request-api/confirmation/index.html',
  'publish/submit/confirmation/index.html',
  'cy/publish/submit/confirmation/index.html',
  'api-catalogue/request-new-api/confirmation/index.html',
  'cy/api-catalogue/request-new-api/confirmation/index.html'
])

// Every file in the export, any type, relative to OUT - so an href/src to a
// missing asset (css, js, image) is just as much a broken link as one to a
// missing page.
const allFiles = new Set()
for (const entry of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (entry.isFile()) {
    const abs = join(entry.parentPath ?? entry.path, entry.name)
    allFiles.add(relative(OUT, abs).split(sep).join('/'))
  }
}

const pages = [...allFiles].filter((f) => f.endsWith('.html'))

// Resolve an href/src found in `fromPage` to the file it targets, relative to
// OUT, or null if it is external, an anchor, or otherwise not ours to check.
function resolveTarget (fromPage, href) {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(href)) return null
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return null

  const [pathPart] = href.split(/[?#]/)
  if (!pathPart) return null

  const resolved = posix.normalize(posix.join(posix.dirname(fromPage), pathPart))
  if (resolved.startsWith('..')) return null

  if (resolved.endsWith('/') || resolved === '' || resolved === '.') {
    return posix.join(resolved === '.' ? '' : resolved, 'index.html')
  }
  return resolved
}

// --- part 1: broken links --------------------------------------------------
//
// Checked directly against the filesystem, not via a linkinator crawl.
// linkinator's own linksToSkip skipped every non-local host, so a crawl was
// never actually verifying external links here - its only real job was
// confirming an internal href/src resolves to a file that exists, which this
// does directly and unambiguously. That directness turned out to matter: a
// linkinator crawl of this exact output reproducibly reported a link to
// get-started/request-api/ (a route removed from the whole export) against
// account/index.html - a page confirmed, byte for byte, not to contain it, in
// both a from-scratch local export and the exact files CI itself had just
// written to disk moments earlier (its own "is the committed export stale"
// check passed on the same run). The false positive survived recurse: true,
// recurse: false and concurrency: 1 alike, so it lives somewhere inside
// linkinator's own crawl/caching, not in anything this script controls about
// how the crawl is shaped. Resolving hrefs against the real filesystem
// sidesteps that entirely.
const HREF_OR_SRC = /\b(?:href|src)="([^"]+)"/g

const broken = []
let checked = 0
for (const page of pages) {
  const html = await readFile(join(OUT, page), 'utf8')
  for (const match of html.matchAll(HREF_OR_SRC)) {
    const target = resolveTarget(page, match[1])
    if (!target) continue
    checked++
    if (!allFiles.has(target)) broken.push({ url: target, parent: page })
  }
}

if (broken.length) {
  const lines = broken.map((link) => `${link.url}  <- ${link.parent}`)
  console.error(`Link gate FAILED - ${broken.length} broken link(s):\n  ` + lines.join('\n  '))
  process.exit(1)
}

// --- part 2: reachability --------------------------------------------------

// Edges come from two places. Plain links are href. Journey steps advance by
// form submission, where the next step is declared in data-next - so that is a
// real edge too, and treating it as one keeps the reachability check meaningful
// for multi-step journeys instead of forcing them onto an exemption list.
//
// The language toggle is deliberately NOT an edge. It is the one link that
// crosses locales, and counting it would let a page orphaned in English stay
// "reachable" via its Welsh counterpart's toggle - which is exactly what a
// mutation test caught. Reachability is checked per locale instead, from that
// locale's own homepage, so each language has to stand up on its own.
const EDGE_ATTRIBUTES = /\b(?:href|data-next)="([^"]+)"/g
const ANCHOR_TAG = /<a\b[^>]*>/g

function edgesFrom (page, html) {
  const targets = new Set()

  // Anchors, skipping the cross-locale toggle.
  for (const tag of html.matchAll(ANCHOR_TAG)) {
    if (/rel="alternate"/.test(tag[0])) continue
    const href = tag[0].match(/\bhref="([^"]+)"/)
    if (!href) continue
    const target = resolveTarget(page, href[1])
    if (target && target !== page) targets.add(target)
  }

  // data-next lives on forms, not anchors.
  for (const match of html.matchAll(/\bdata-next="([^"]+)"/g)) {
    const target = resolveTarget(page, match[1])
    if (target && target !== page) targets.add(target)
  }

  return targets
}

const graph = new Map()
for (const page of pages) {
  graph.set(page, edgesFrom(page, await readFile(join(OUT, page), 'utf8')))
}

const manifest = await loadManifest()
const locales = manifest.locales ?? ['en']
const roots = locales.map((locale) => (locale === 'en' ? 'index.html' : `${locale}/index.html`))

const orphansByLocale = []

for (const [index, root] of roots.entries()) {
  const locale = locales[index]
  const prefix = locale === 'en' ? '' : `${locale}/`

  const reached = new Set([root])
  const queue = [root]
  while (queue.length) {
    for (const next of graph.get(queue.shift()) ?? []) {
      if (!reached.has(next)) {
        reached.add(next)
        queue.push(next)
      }
    }
  }

  // Only judge pages belonging to this locale.
  const localePages = pages.filter((page) => {
    if (ALLOW_UNREACHABLE.has(page)) return false
    const pageLocale = locales.find((l) => l !== 'en' && page.startsWith(`${l}/`)) ?? 'en'
    return pageLocale === locale
  })

  const orphans = localePages.filter((page) => !reached.has(page))
  if (orphans.length) orphansByLocale.push({ locale, root, orphans })
  void prefix
}

if (orphansByLocale.length) {
  const detail = orphansByLocale
    .map(({ locale, root, orphans }) => `[${locale}] ${orphans.length} page(s) unreachable from ${root}:\n      ` + orphans.join('\n      '))
    .join('\n  ')
  console.error(
    'Link gate FAILED - unreachable pages:\n  ' + detail +
    '\n\nLink to them from a page that is reachable in the same language, or add them to ' +
    'ALLOW_UNREACHABLE if that is deliberate. The language toggle does not count as a link.'
  )
  process.exit(1)
}

console.log(
  `Link gate passed - ${checked} internal link(s) checked, ` +
  `${pages.length} page(s) all reachable within their own language`
)
