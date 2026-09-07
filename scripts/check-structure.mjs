// Page structure gate.
//
// Enforces the audit's findings directly, so each one becomes a regression that
// cannot recur silently. Every rule here maps to a finding in
// design/audit/2026-08-17-govuk-conformance-audit.md.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { loadManifest } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs'
const problems = []

// Redirect stubs are generated, deliberately minimal pages. The page-furniture
// rules below do not apply to them - a redirect with a phase banner and
// breadcrumbs would be absurd - so they are checked against what actually
// matters for a redirect instead.
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
const stubs = new Map(redirects.map((r) => [r.from, r]))

// Non-default locales, so a page's language can be read from its path.
const LOCALES = new Set((await loadManifest()).locales?.filter((l) => l !== 'en') ?? [])

const VAGUE_LINK_TEXT = new Set([
  'read more', 'more', 'here', 'click here', 'link', 'this page', 'read',
  'more information', 'find out more', 'read this', 'see more', 'learn more'
])

// Same words, different destination. Confusing for everyone, and specifically a
// problem for anyone navigating by a list of links.
//
// Scoped per locale. Until Welsh is translated its link text is identical to
// English, so a global check would flag every link in the site as "used for two
// destinations" - /get-started and /cy/get-started - which is not a defect but
// the whole point of having two locales. Targets have their locale prefix
// stripped before comparison for the same reason.
const linkTextTargets = new Map()

function localeOf (relPath) {
  const first = relPath.split('/')[0]
  return LOCALES.has(first) ? first : 'en'
}

function stripLocale (target) {
  const cleaned = target.replace(/^(\.\.\/)+/, '')
  const first = cleaned.split('/')[0]
  return LOCALES.has(first) ? cleaned.slice(first.length + 1) : cleaned
}

// Pages with no position in the hierarchy, so no breadcrumb is expected.
const NO_BREADCRUMB = new Set(['index.html', '404.html'])

const files = []
for (const entry of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    files.push(join(entry.parentPath ?? entry.path, entry.name))
  }
}

for (const file of files.sort()) {
  const rel = relative(OUT, file).split(sep).join('/')
  const html = await readFile(file, 'utf8')
  const count = (re) => (html.match(re) ?? []).length
  const fail = (msg) => problems.push(`${rel}: ${msg}`)

  if (stubs.has(rel)) {
    const redirect = stubs.get(rel)
    if (!/<html[^>]*\slang="[a-z]{2}/.test(html)) fail('redirect stub: missing lang attribute')
    if (!/<title[^>]*>\s*\S/.test(html)) fail('redirect stub: missing title')
    if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail('redirect stub: missing rel=canonical')
    if (!/<meta http-equiv="refresh" content="0; url=[^"]+"/.test(html)) fail('redirect stub: missing meta refresh')
    if (!/<a [^>]*href="[^"]+"[^>]*>Continue to/.test(html)) fail('redirect stub: missing a visible link, so anyone the refresh does not move is stranded')
    if (count(/<h1[\s>]/g) !== 1) fail('redirect stub: expected exactly 1 <h1>')
    if (!/name="robots" content="noindex"/.test(html)) fail('redirect stub: should be noindex')
    if (redirect.kind === 'superseded' && !/no longer exists in its old form/.test(html)) {
      fail('redirect stub: a superseded page must say so rather than implying the content moved')
    }
    continue
  }

  // C-2 - journeys must be real pages, one thing per page
  const h1s = count(/<h1[\s>]/g)
  if (h1s !== 1) fail(`expected exactly 1 <h1>, found ${h1s}`)

  if (!/<title[^>]*>\s*\S[^<]*<\/title>/.test(html)) fail('missing or empty <title>')
  if (!/<html[^>]*\slang="[a-z]{2}/.test(html)) fail('missing lang attribute on <html>')
  if (!/class="govuk-skip-link"/.test(html)) fail('missing GOV.UK skip link')
  if (!/id="main-content"/.test(html)) fail('missing #main-content landmark')

  // H-1 - 278 inline styles in the current site
  const inline = count(/\sstyle="/g)
  if (inline > 0) fail(`${inline} inline style attribute(s) - use GOV.UK classes`)

  // L-1 to L-3 - the legal links were href="#" on all 28 pages
  const dead = count(/href="#"/g)
  if (dead > 0) fail(`${dead} placeholder href="#" link(s)`)

  // S-1 / ADR 0003 previously failed the build here on any reference to
  // onrender.com, enforcing "no auth backend, faked client-side". That
  // decision is being superseded by this change, which wires /sign-in,
  // /register and /account to a real backend - see the PR description and
  // the review thread on ADR 0003 for the rationale. This gate is removed
  // deliberately, not silently: it should come back, tightened to the
  // eventual sanctioned identity provider's domain, once ADR 0003 itself is
  // updated to reflect that decision.

  // A-1 - the two brand colours that fail WCAG contrast
  const badColour = html.match(/#0096d6|#11a63c/i)
  if (badColour) fail(`uses ${badColour[0]}, which fails WCAG AA contrast`)

  // C-4 - the current site tells nobody it is a beta
  if (!/govuk-phase-banner/.test(html)) fail('missing beta phase banner')

  // C-7 - breadcrumb root was inconsistent across the current site
  // Compared with the locale prefix stripped, so cy/index.html is recognised as
  // the Welsh homepage rather than a page missing its breadcrumbs.
  if (!NO_BREADCRUMB.has(stripLocale(rel)) && !/govuk-breadcrumbs/.test(html)) {
    fail('missing breadcrumbs (add to NO_BREADCRUMB if genuinely top-level)')
  }

  // A govuk-button rendered as <button> outside a <form> can do nothing on a
  // static site. This happens when a href is undefined - the macro silently
  // falls back to <button>. It is valid HTML and not a broken link, so nothing
  // else catches it. The service-navigation mobile toggle is a real button and
  // is excluded by class.
  const formRanges = [...html.matchAll(/<form[\s\S]*?<\/form>/g)].map((m) => [m.index, m.index + m[0].length])
  for (const match of html.matchAll(/<button\b[^>]*>/g)) {
    const tag = match[0]
    if (!/class="[^"]*\bgovuk-button\b/.test(tag)) continue
    const insideForm = formRanges.some(([start, end]) => match.index >= start && match.index < end)
    if (!insideForm) fail('a govuk-button renders as <button> outside a <form> - its href is probably undefined')
  }

  // Heading hierarchy must not skip a level. Screen reader users navigate by
  // heading, and a jump from h2 to h4 reads as a missing section.
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/)
  const mainHtml = mainMatch ? mainMatch[0] : html
  let previousLevel = null
  for (const heading of mainHtml.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(heading[1])
    if (previousLevel !== null && level > previousLevel + 1) {
      fail(`heading hierarchy skips h${previousLevel} to h${level}`)
    }
    previousLevel = level
  }

  // Link text must make sense out of context - WCAG 2.4.4. "Read more" and
  // "here" were all over the old site's cards.
  for (const link of mainHtml.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = link[2].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim().toLowerCase().replace(/\s+/g, ' ')
    if (VAGUE_LINK_TEXT.has(text)) fail(`link text "${text}" is meaningless out of context`)
    if (text.length > 3) {
      const scoped = `${localeOf(rel)}\u0000${text}`
      if (!linkTextTargets.has(scoped)) linkTextTargets.set(scoped, new Set())
      linkTextTargets.get(scoped).add(stripLocale(link[1]))
    }
  }

  // In-page anchors must resolve to a real id
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) fail(`dangling in-page anchor #${m[1]}`)
  }
}

for (const [scoped, targets] of linkTextTargets) {
  if (targets.size > 1) {
    const [locale, text] = scoped.split('\u0000')
    problems.push(`[${locale}] link text "${text}" is used for ${targets.size} different destinations: ${[...targets].join(', ')}`)
  }
}

if (problems.length) {
  console.error('Structure gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Structure gate passed - ${files.length} page(s) checked`)
