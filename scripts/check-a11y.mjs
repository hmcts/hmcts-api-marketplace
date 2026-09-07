// Accessibility gate - axe against WCAG 2.1 AA on every exported page.
//
// This is the gate that stops audit finding A-1 recurring: the current site
// uses a 3.32:1 link colour on all 28 pages, which axe reports as a contrast
// failure. It runs over every declared route, not a sample.
//
// Drives a real Chrome rather than a bundled Chromium - see .puppeteerrc.cjs.

import { readFile, access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import pa11y from 'pa11y'
import { loadRoutes } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs'
const PORT = Number(process.env.A11Y_PORT ?? 8149)
const routes = await loadRoutes()

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean)

async function resolveChrome () {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate)
      return candidate
    } catch {}
  }
  console.error(
    'Accessibility gate could not find a Chrome executable.\n' +
    'Set CHROME_PATH, or install Chrome/Chromium. Tried:\n  ' +
    CHROME_CANDIDATES.join('\n  ')
  )
  process.exit(1)
}

function urlFor (route) {
  if (route === '/') return `http://localhost:${PORT}/`
  if (route === '/404') return `http://localhost:${PORT}/404.html`
  return `http://localhost:${PORT}${route}/`
}

const executablePath = await resolveChrome()
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', OUT], {
  stdio: 'ignore'
})

// Give the static server a moment, then confirm it is actually up.
await new Promise((resolve) => setTimeout(resolve, 1200))
try {
  const probe = await fetch(`http://localhost:${PORT}/`)
  if (!probe.ok) throw new Error(`HTTP ${probe.status}`)
} catch (err) {
  server.kill()
  console.error(`Accessibility gate could not serve ${OUT}: ${err.message}`)
  process.exit(1)
}

let pagesWithIssues = 0
let totalIssues = 0

try {
  for (const { path, name } of routes) {
    const result = await pa11y(urlFor(path), {
      runners: ['axe'],
      standard: 'WCAG2AA',
      includeWarnings: false,
      includeNotices: false,
      chromeLaunchConfig: { executablePath, args: ['--no-sandbox'] }
    })

    if (result.issues.length) {
      pagesWithIssues++
      totalIssues += result.issues.length
      console.error(`\n${name} (${path}) - ${result.issues.length} issue(s):`)
      for (const issue of result.issues) {
        console.error(`  ${issue.code}\n    ${issue.message}\n    ${issue.selector}`)
      }
    }
  }
} finally {
  server.kill()
  await once(server, 'exit').catch(() => {})
}

if (pagesWithIssues) {
  console.error(`\nAccessibility gate FAILED - ${totalIssues} issue(s) across ${pagesWithIssues} page(s)`)
  process.exit(1)
}

console.log(`Accessibility gate passed - ${routes.length} page(s), WCAG2AA via axe`)
