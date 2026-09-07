// Mutation-tests the gates.
//
// A gate that has never failed has not been shown to work. This breaks each
// thing a gate claims to check and asserts that the gate fails. It is not
// optional ceremony: the link gate's first implementation reported "0 internal
// links checked" and passed while checking nothing, because its skip-external
// pattern also matched linkinator's own local server. Only a mutation test
// catches that class of bug.
//
// Works on a throwaway copy, so docs/v2 is never modified.

import { readFile, writeFile, cp, rm, mkdir, access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const SOURCE = process.env.EXPORT_OUT ?? 'docs'
const WORK = '.gate-verify'
const COPY = join(WORK, 'v2')

// Default page for HTML-level mutations. Any exported page would do; a section
// page keeps it away from the special-cased index. Individual mutations can
// override it with `target` when they need to break a specific relationship.
const TARGET = 'publish/index.html'

const gates = {
  manifest: () => spawnSync('node', ['scripts/check-manifest.mjs'], { env: env(), encoding: 'utf8' }),
  structure: () => spawnSync('node', ['scripts/check-structure.mjs'], { env: env(), encoding: 'utf8' }),
  links: () => spawnSync('node', ['scripts/check-links.mjs'], { env: env(), encoding: 'utf8' }),
  a11y: () => spawnSync('node', ['scripts/check-a11y.mjs'], { env: env(), encoding: 'utf8' }),
  html: () => spawnSync('npx', ['html-validate', `${COPY}/**/*.html`], { encoding: 'utf8' }),
  reflow: () => spawnSync('node', ['scripts/check-reflow.mjs'], { env: { ...env(), REFLOW_PORT: '8154' }, encoding: 'utf8' }),
  translations: () => spawnSync('node', ['scripts/check-translations.mjs'], { env: env(), encoding: 'utf8' })
}

function env () {
  return { ...process.env, EXPORT_OUT: COPY, A11Y_PORT: '8151' }
}

const LOCALE_CY = 'prototype-kit/app/locales/cy.json'
const LOCALE_EN = 'prototype-kit/app/locales/en.json'

const mutations = [
  {
    // Key drift is the thing that actually rots a bilingual site: a string added
    // to English that translators never see.
    gate: 'translations',
    what: 'a Welsh key missing entirely, so translators would never see it',
    file: LOCALE_CY,
    edit: (json) => { delete json.nav.publish; return json }
  },
  {
    gate: 'translations',
    what: 'a Welsh key that does not exist in English',
    file: LOCALE_CY,
    edit: (json) => { json.nav.somethingRemoved = 'Rhywbeth'; return json }
  },
  {
    gate: 'translations',
    what: 'an empty string used instead of null to mean untranslated',
    file: LOCALE_CY,
    edit: (json) => { json.nav.help = ''; return json }
  },
  {
    gate: 'translations',
    what: 'an empty string in the source language',
    file: LOCALE_EN,
    edit: (json) => { json.nav.help = ''; return json }
  },
  {
    gate: 'structure',
    what: 'a second <h1>',
    html: (h) => h.replace('</main>', '<h1>Second heading</h1></main>')
  },
  {
    gate: 'structure',
    what: 'an inline style attribute',
    html: (h) => h.replace('<h1 class="govuk-heading-xl"', '<h1 style="color:#ff0000" class="govuk-heading-xl"')
  },
  {
    gate: 'structure',
    what: 'a placeholder href="#"',
    html: (h) => h.replace('</main>', '<a href="#">Cookies</a></main>')
  },
  {
    gate: 'structure',
    what: 'a brand colour that fails contrast',
    html: (h) => h.replace('</main>', '<p class="govuk-body">#0096d6</p></main>')
  },
  {
    gate: 'structure',
    what: 'a removed beta phase banner',
    html: (h) => h.replaceAll('govuk-phase-banner', 'govuk-was-a-phase-banner')
  },
  {
    gate: 'structure',
    what: 'a dangling in-page anchor',
    html: (h) => h.replace('</main>', '<a href="#nowhere">Jump</a></main>')
  },
  // The "reintroduced onrender.com reference" self-test lived here, checking
  // the S-1 / ADR 0003 gate in check-structure.mjs. That gate is deliberately
  // removed as part of wiring real auth into /sign-in, /register and
  // /account - see check-structure.mjs and the PR description. This self-test
  // went with it, for the same reason.
  {
    gate: 'links',
    what: 'a link to a page that does not exist',
    html: (h) => h.replace('</main>', '<a href="../does-not-exist/">Gone</a></main>')
  },
  {
    // producer-standards has two inbound links, so removing one does not orphan
    // it. check-answers has exactly one - the data-next edge from the form -
    // so cutting that orphans both it and confirmation.
    gate: 'links',
    what: 'a page left unreachable from the homepage',
    // Was publish/submit. That journey is now owned by the hosted web app and
    // its pages are allowlisted in check-links.mjs, so cutting its edge orphans
    // nothing and this mutation would stop biting. request-new-api is still
    // served from here, still linked, and its check-answers is not allowlisted.
    target: 'api-catalogue/request-new-api/index.html',
    html: (h) => h.replace('data-next="check-answers/"', 'data-next=""')
  },
  {
    // This is the bug that shipped: a govuk-button with an undefined href
    // silently renders as <button>, which is valid HTML and not a broken link,
    // so no other gate noticed the link had vanished. Originally targeted the
    // api-catalogue signpost button - that page was rebuilt into a real
    // listing (see ADR 0005) and no longer has a govukButton-as-link at all,
    // so this retargets to another still-live example of the same pattern.
    gate: 'structure',
    what: 'a govuk-button rendered dead, outside a form',
    target: 'get-started/index.html',
    html: (h) => h.replace(
      /<a href="\.\.\/api-catalogue\/"([^>]*class="govuk-button[^>]*)>/,
      '<button type="submit"$1>'
    )
  },
  {
    gate: 'html',
    what: 'malformed markup (unclosed element)',
    html: (h) => h.replace('</main>', '<div class="govuk-body"></main>')
  },
  {
    // The defect this gate was written for: wide content with no scroll
    // container pushes the whole page sideways at 320px.
    gate: 'reflow',
    what: 'wide content that pushes the page sideways at 320px',
    target: 'publish/data-governance/index.html',
    // Strip only the class, so the markup stays valid and the single thing
    // being removed is the overflow container.
    html: (h) => h.replace('<section class="app-table-wrapper"', '<section')
  },
  {
    gate: 'a11y',
    what: 'an image with no alt text',
    html: (h) => h.replace('</main>', '<img src="../plugin-assets/govuk-frontend/dist/govuk/assets/images/govuk-crest.svg"></main>')
  },
  {
    gate: 'structure',
    what: 'a heading hierarchy that skips a level',
    html: (h) => h.replace('</main>', '<h4>Skipped from h2 to h4</h4></main>')
  },
  {
    gate: 'structure',
    what: 'link text that is meaningless out of context',
    html: (h) => h.replace('</main>', '<a href="../help/">Read more</a></main>')
  },
  {
    gate: 'structure',
    what: 'the same link text used for two different destinations',
    html: (h) => h.replace('</main>', '<a href="../help/">API producer standards</a></main>')
  },
  {
    gate: 'structure',
    what: 'a redirect stub with no rel=canonical',
    target: 'getting-started.html',
    html: (h) => h.replace(/<link rel="canonical"[^>]*>/, '')
  },
  {
    gate: 'structure',
    what: 'a redirect stub with no meta refresh',
    target: 'getting-started.html',
    html: (h) => h.replace(/<meta http-equiv="refresh"[^>]*>/, '')
  },
  {
    gate: 'structure',
    what: 'a redirect stub with no visible link, stranding anyone the refresh misses',
    target: 'getting-started.html',
    html: (h) => h.replace(/<a class="govuk-link"[^>]*>Continue to[^<]*<\/a>/, 'gone')
  },
  {
    // A page whose feature does not exist yet must not imply its content simply
    // moved somewhere else.
    gate: 'structure',
    what: 'a superseded stub pretending the content moved',
    target: 'community.html',
    html: (h) => h.replace('This page no longer exists in its old form.', 'This page has a new address.')
  },
  {
    gate: 'links',
    what: 'a redirect stub pointing at a page that does not exist',
    target: 'getting-started.html',
    html: (h) => h.replaceAll('get-started/', 'gone-away/')
  },
  {
    gate: 'manifest',
    what: 'a declared redirect missing from the output',
    fs: async () => rm(join(COPY, 'getting-started.html'))
  },
  {
    gate: 'manifest',
    what: 'an output file not declared in the manifest',
    fs: async () => writeFile(
      join(COPY, 'stray.html'),
      '<!DOCTYPE html><html lang="en"><head><title>Stray</title></head><body><h1>Stray</h1></body></html>'
    )
  },
  {
    gate: 'manifest',
    what: 'a declared route missing from the output',
    fs: async () => rm(join(COPY, 'publish/index.html'))
  }
]

try {
  await access(SOURCE)
} catch {
  console.error(`Nothing to verify against: ${SOURCE} does not exist. Run "npm run export" first.`)
  process.exit(1)
}

await rm(WORK, { recursive: true, force: true })
await mkdir(WORK, { recursive: true })
await cp(SOURCE, join(WORK, 'pristine'), { recursive: true })

let failures = 0

for (const mutation of mutations) {
  await rm(COPY, { recursive: true, force: true })
  await cp(join(WORK, 'pristine'), COPY, { recursive: true })

  if (mutation.edit) {
    // Locale files live in the source tree, not the export, so they are backed
    // up and restored rather than copied.
    const original = await readFile(mutation.file, 'utf8')
    await writeFile(mutation.file, JSON.stringify(mutation.edit(JSON.parse(original)), null, 2) + '\n', 'utf8')
    const result = gates[mutation.gate]()
    await writeFile(mutation.file, original, 'utf8')
    const caught = result.status !== 0
    console.log(`${caught ? 'PASS' : 'FAIL'}  gate:${mutation.gate} catches ${mutation.what}`)
    if (!caught) {
      failures++
      console.log('      gate output was:')
      console.log('      ' + (result.stdout ?? '').trim().split('\n').join('\n      '))
    }
    continue
  }

  if (mutation.html) {
    const file = join(COPY, mutation.target ?? TARGET)
    const before = await readFile(file, 'utf8')
    const after = mutation.html(before)
    if (after === before) {
      console.log(`SKIP  ${mutation.gate}: mutation "${mutation.what}" did not change the file`)
      failures++
      continue
    }
    await writeFile(file, after, 'utf8')
  } else {
    await mutation.fs()
  }

  const result = gates[mutation.gate]()
  const caught = result.status !== 0

  console.log(`${caught ? 'PASS' : 'FAIL'}  gate:${mutation.gate} catches ${mutation.what}`)
  if (!caught) {
    failures++
    console.log('      gate output was:')
    console.log('      ' + (result.stdout ?? '').trim().split('\n').join('\n      '))
  }
}

await rm(WORK, { recursive: true, force: true })

if (failures) {
  console.error(`\n${failures} of ${mutations.length} mutation(s) were NOT caught. Those gates are not trustworthy.`)
  process.exit(1)
}

console.log(`\nAll ${mutations.length} mutations caught. Gates verified.`)
