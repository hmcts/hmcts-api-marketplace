// Renders every route in scripts/routes.manifest.json from a running
// Prototype Kit into docs/ as a self-contained static site.
//
// Two design decisions worth knowing:
//
// 1. An explicit manifest, not a crawler. A route that fails to render fails
//    the build instead of silently vanishing from the output.
//
// 2. Assets are fetched and followed, not copied from a directory. The Kit
//    serves them from /public/** and two virtual /plugin-assets/** roots, so
//    there is no single source directory to copy. Fetching what the pages
//    actually reference also guarantees the output contains exactly that.
//
// Root-absolute paths are rewritten to depth-correct relative ones, in HTML
// and inside text assets, so the site works served from a subdirectory such as
// https://hmcts.github.io/hmcts-api-marketplace/v2/.
//
// Run the Kit first: npm run kit   (it pins PORT=3100 deliberately — the Kit
// prompts interactively if its port is busy and dies on closed stdin.)

import { mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { loadRoutes, outputRelFor, linkRelFor } from './routes.mjs'

const BASE = process.env.EXPORT_BASE_URL ?? 'http://localhost:3100'
const OUT = process.env.EXPORT_OUT ?? 'docs'

// Roots the Kit serves assets from.
const ASSET_ROOTS = ['/plugin-assets/', '/public/']

// Kit development tooling. kit.js drives the "Manage your prototype" UI and
// auto-store-data.js posts form data to a server session — neither of which
// exists in a static export, so both are removed rather than shipped dead.
const STRIP_SCRIPTS = [
  '/plugin-assets/govuk-prototype-kit/lib/assets/javascripts/kit.js',
  '/plugin-assets/govuk-prototype-kit/lib/assets/javascripts/auto-store-data.js'
]

const TEXT_EXTENSIONS = ['.css', '.js', '.mjs', '.json', '.svg', '.webmanifest']

const routes = await loadRoutes()
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))

// A file at "a/b/c.html" needs "../../" to reach OUT.
function prefixFor (relPath) {
  return '../'.repeat(relPath.split('/').length - 1)
}

const routeTargets = new Map(routes.map(({ path }) => [path, linkRelFor(path)]))
const assetQueue = []
const seenAssets = new Set()
const unknownLinks = new Map()

function queueAsset (absPath) {
  const clean = absPath.split(/[?#]/)[0]
  if (!seenAssets.has(clean)) {
    seenAssets.add(clean)
    assetQueue.push(clean)
  }
}

function isAsset (absPath) {
  return ASSET_ROOTS.some((root) => absPath.startsWith(root))
}

function stripDevScripts (html) {
  let out = html
  for (const src of STRIP_SCRIPTS) {
    out = out.replace(new RegExp(`\\s*<script[^>]*src="${src}"[^>]*>\\s*</script>`, 'g'), '')
  }
  return out
}

// Rewrites every root-absolute href/src. Assets get queued for download;
// declared routes point at their output location; anything else is recorded so
// the export can report links to pages that are not in the manifest.
//
// A route lookup ignores any ?query or #fragment - "/get-started/onboarding-
// guide#producer-onboarding" targets the same route as the bare path, just at
// a specific point on the page. The suffix is carried over untouched onto the
// rewritten href, after the path is resolved.
function rewriteHtml (html, prefix, sourceRoute) {
  return html.replace(/\b(href|src)="(\/[^"]*)"/g, (whole, attr, absPath) => {
    if (absPath.startsWith('//')) return whole

    if (isAsset(absPath)) {
      queueAsset(absPath)
      return `${attr}="${prefix}${absPath.slice(1)}"`
    }

    const [, pathPart, suffix = ''] = absPath.match(/^([^?#]*)([?#].*)?$/)

    const bare = pathPart.replace(/\/$/, '') || '/'
    if (routeTargets.has(bare)) {
      return `${attr}="${prefix}${routeTargets.get(bare)}${suffix}"`
    }

    if (!unknownLinks.has(absPath)) unknownLinks.set(absPath, new Set())
    unknownLinks.get(absPath).add(sourceRoute)
    const guess = pathPart.replace(/^\//, '').replace(/\/?$/, '/')
    return `${attr}="${prefix}${guess}${suffix}"`
  })
}

// Text assets reference other assets too — fonts from CSS, most notably.
function rewriteTextAsset (body, prefix) {
  let out = body
  for (const root of ASSET_ROOTS) {
    out = out.replaceAll(root, `${prefix}${root.slice(1)}`)
  }
  for (const match of body.matchAll(/\/(?:plugin-assets|public)\/[A-Za-z0-9._/-]+/g)) {
    queueAsset(match[0])
  }
  return out
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

// --- pages -----------------------------------------------------------------

const pageFailures = []

for (const { path, name } of routes) {
  let res
  try {
    res = await fetch(new URL(path, BASE))
  } catch (err) {
    pageFailures.push(`${path} (${name}) -> ${err.message}`)
    continue
  }
  if (!res.ok) {
    pageFailures.push(`${path} (${name}) -> HTTP ${res.status}`)
    continue
  }

  const relPath = outputRelFor(path)
  const html = rewriteHtml(stripDevScripts(await res.text()), prefixFor(relPath), path)
  const outFile = join(OUT, relPath)
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, html, 'utf8')
}

if (pageFailures.length) {
  console.error('Export failed for:\n  ' + pageFailures.join('\n  '))
  process.exit(1)
}

// --- redirect stubs --------------------------------------------------------
//
// GitHub Pages has no server-side redirects, so each old URL gets a real page
// carrying rel=canonical, a meta refresh, and a visible link for anyone the
// refresh does not move (and for anyone reading with the refresh blocked).
// Without these, every URL the current site publishes 404s at promotion.

function redirectStub ({ to, kind, because }, target) {
  const moved = kind === 'moved'
  const title = moved ? 'This page has moved' : 'This page is not available'
  const lead = moved
    ? 'This page has a new address. You will be taken there automatically.'
    : 'This page no longer exists in its old form.'
  const reason = because ? `<p class="govuk-body">${because}</p>` : ''

  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
<meta charset="utf-8">
<title>${title} - HMCTS API Marketplace - GOV.UK</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="stylesheet" href="public/stylesheets/application.css">
</head>
<body class="govuk-template__body">
<div class="govuk-width-container">
<main class="govuk-main-wrapper" id="main-content">
<h1 class="govuk-heading-l">${title}</h1>
<p class="govuk-body">${lead}</p>
${reason}
<p class="govuk-body"><a class="govuk-link" href="${target}">Continue to ${to}</a></p>
</main>
</div>
</body>
</html>
`
}

const redirectFailures = []
const declaredRoutes = new Set(routes.map((r) => r.path))

for (const redirect of redirects) {
  if (!declaredRoutes.has(redirect.to)) {
    redirectFailures.push(`${redirect.from} -> ${redirect.to} is not a declared route`)
    continue
  }
  // Stubs sit at the output root, so the target is relative to there.
  const target = linkRelFor(redirect.to) || './'
  const outFile = join(OUT, redirect.from)
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, redirectStub(redirect, target), 'utf8')
}

if (redirectFailures.length) {
  console.error('Redirect targets invalid:\n  ' + redirectFailures.join('\n  '))
  process.exit(1)
}

// --- assets ----------------------------------------------------------------

const assetFailures = []
let assetCount = 0

while (assetQueue.length) {
  const absPath = assetQueue.shift()
  let res
  try {
    res = await fetch(new URL(absPath, BASE))
  } catch (err) {
    assetFailures.push(`${absPath} -> ${err.message}`)
    continue
  }
  if (!res.ok) {
    assetFailures.push(`${absPath} -> HTTP ${res.status}`)
    continue
  }

  const relPath = absPath.slice(1)
  const outFile = join(OUT, relPath)
  await mkdir(dirname(outFile), { recursive: true })

  if (TEXT_EXTENSIONS.some((ext) => relPath.endsWith(ext))) {
    await writeFile(outFile, rewriteTextAsset(await res.text(), prefixFor(relPath)), 'utf8')
  } else {
    await writeFile(outFile, Buffer.from(await res.arrayBuffer()))
  }
  assetCount++
}

if (assetFailures.length) {
  console.error('Asset export failed for:\n  ' + assetFailures.join('\n  '))
  process.exit(1)
}

console.log(`Exported ${routes.length} page(s), ${redirects.length} redirect(s) and ${assetCount} asset(s) to ${OUT}`)

if (unknownLinks.size) {
  console.warn('\nLinks to pages not in the manifest (the link gate will flag these):')
  for (const [link, sources] of [...unknownLinks].sort()) {
    console.warn(`  ${link}  <- ${[...sources].join(', ')}`)
  }
}
