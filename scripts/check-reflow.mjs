// Reflow gate - WCAG 2.1 success criterion 1.4.10, level AA.
//
// Content must reflow to a 320px-wide viewport without requiring the user to
// scroll in two directions. This is not something axe can detect, so the
// accessibility gate does not cover it: axe inspects the accessibility tree,
// and reflow is a layout property that only shows up when you actually make the
// window narrow.
//
// It found a real defect the first time it ran: the data governance
// classification table was 486px of content inside a 288px column, pushing the
// whole page sideways on any phone.
//
// Every declared route is loaded at 320px and checked for horizontal overflow.
// Elements are allowed to scroll internally - a wide table inside an
// overflow-x container is the correct fix - but the document must not.

import { readFile, access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import puppeteer from 'puppeteer'
import { loadRoutes } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs'
const PORT = Number(process.env.REFLOW_PORT ?? 8153)
const VIEWPORT_WIDTH = 320
const TOLERANCE = 1 // sub-pixel rounding

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
    'Reflow gate could not find a Chrome executable.\n' +
    'Set CHROME_PATH, or install Chrome/Chromium. Tried:\n  ' + CHROME_CANDIDATES.join('\n  ')
  )
  process.exit(1)
}

function urlFor (route) {
  if (route === '/') return `http://localhost:${PORT}/`
  if (route === '/404') return `http://localhost:${PORT}/404.html`
  return `http://localhost:${PORT}${route}/`
}

const executablePath = await resolveChrome()
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', OUT], { stdio: 'ignore' })
await new Promise((resolve) => setTimeout(resolve, 1200))

try {
  const probe = await fetch(`http://localhost:${PORT}/`)
  if (!probe.ok) throw new Error(`HTTP ${probe.status}`)
} catch (err) {
  server.kill()
  console.error(`Reflow gate could not serve ${OUT}: ${err.message}`)
  process.exit(1)
}

const browser = await puppeteer.launch({ executablePath, args: ['--no-sandbox'] })
const problems = []

try {
  const page = await browser.newPage()
  await page.setViewport({ width: VIEWPORT_WIDTH, height: 800, deviceScaleFactor: 1 })

  for (const { path, name } of routes) {
    await page.goto(urlFor(path), { waitUntil: 'networkidle0' })

    const result = await page.evaluate((tolerance) => {
      const docWidth = document.documentElement.scrollWidth
      const viewport = window.innerWidth
      const culprits = []

      if (docWidth > viewport + tolerance) {
        // Name what is actually sticking out, so the failure is actionable
        // rather than just "the page is too wide".
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect()
          if (rect.width === 0) continue
          if (rect.right > viewport + tolerance) {
            const style = window.getComputedStyle(el)
            // An element that scrolls internally is fine - that is the fix.
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue
            const parent = el.parentElement
            if (parent) {
              const parentStyle = window.getComputedStyle(parent)
              if (parentStyle.overflowX === 'auto' || parentStyle.overflowX === 'scroll') continue
            }
            culprits.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 60),
              right: Math.round(rect.right),
              text: (el.textContent || '').trim().slice(0, 40)
            })
          }
        }
      }

      return { docWidth, viewport, culprits: culprits.slice(0, 5) }
    }, TOLERANCE)

    if (result.docWidth > result.viewport + TOLERANCE) {
      const overflow = result.docWidth - result.viewport
      const detail = result.culprits.length
        ? result.culprits.map((c) => `      <${c.tag} class="${c.cls}"> extends to ${c.right}px  "${c.text}"`).join('\n')
        : '      (could not attribute the overflow to a single element)'
      problems.push(`${name} (${path}) overflows ${VIEWPORT_WIDTH}px by ${overflow}px:\n${detail}`)
    }
  }
} finally {
  await browser.close()
  server.kill()
  await once(server, 'exit').catch(() => {})
}

if (problems.length) {
  console.error(
    `Reflow gate FAILED - ${problems.length} page(s) do not reflow to ${VIEWPORT_WIDTH}px ` +
    '(WCAG 1.4.10):\n  ' + problems.join('\n  ') +
    '\n\nWrap wide content in an element with overflow-x: auto so it scrolls instead of the page.'
  )
  process.exit(1)
}

console.log(`Reflow gate passed - ${routes.length} page(s) reflow to ${VIEWPORT_WIDTH}px`)
