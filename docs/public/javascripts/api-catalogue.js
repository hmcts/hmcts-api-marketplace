/* global window, document, jsyaml */

//
// The API catalogue: a listing page and one shared detail page, both reading
// live data at runtime rather than from anything checked into this repo. See
// design/adr/0005-in-repo-api-catalogue.md for why.
//
// Fetching and shaping the feed itself lives in catalogue-data.js, shared
// with the Request API access form's dropdown - both need the same live
// list of what actually exists, not two copies that can drift apart.
//
// The other data source, an API's own OpenAPI spec, stays here: nothing
// outside the catalogue pages needs it.
//
//   https://raw.githubusercontent.com/hmcts/<name>/...    that API's own OpenAPI spec
//
// Its failure is not treated as exceptional - a repo without a spec at the
// guessed path is normal, not a bug, and the UI says so rather than breaking.
//

(function () {
  'use strict'

  var fetchCatalogue = window.HmctsCatalogue.fetchCatalogue

  function escapeHtml (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // ------------------------------------------------------------ navigation
  //
  // Built from location.pathname rather than a relative href, so it is
  // correct whether the browser is on ".../api-catalogue" (no trailing
  // slash, as the Kit's dev server serves it) or ".../api-catalogue/" (as a
  // real static host serves it after its own redirect) - and correct again
  // if the whole site is one day served from a subpath. A relative href left
  // the equivalent request-api journey resolving one directory too high
  // under the bare dev-server URL; this sidesteps that class of bug rather
  // than relying on everyone remembering to test through a real server.
  //
  // No trailing slash on the target: the Kit's own dev server 404s on a
  // trailing slash for a route two segments deep (confirmed against
  // /get-started/onboarding-guide/, unrelated to this page), while a real
  // static host 301s straight to the slash version and carries the query
  // string across - verified against the live GitHub Pages site. Leaving it
  // off works on both; adding it only works on one.

  function detailUrl (apiName) {
    return window.location.pathname.replace(/\/$/, '') + '/detail?api=' + encodeURIComponent(apiName)
  }

  function catalogueUrl () {
    return window.location.pathname.replace(/\/?detail\/?$/, '/')
  }

  // Same reasoning as catalogueUrl/detailUrl above: built from the site root
  // rather than hardcoded, so it still resolves once the site is served from
  // a subpath (as it is on GitHub Pages) rather than the origin root.
  function requestApiUrl () {
    return catalogueUrl().replace(/api-catalogue\/$/, '') + 'get-started/request-api'
  }

  // ------------------------------------------------------------------ data
  //
  // fetchCatalogue itself - along with domain/platform inference and repo
  // link derivation - lives in catalogue-data.js, loaded before this file.

  // -------------------------------------------------------- listing page

  function initListing () {
    var root = document.querySelector('[data-catalogue-list]')
    if (!root) return

    var searchInput = document.querySelector('[data-catalogue-search]')
    var countEl = document.querySelector('[data-catalogue-count]')
    var azNavEl = document.querySelector('[data-catalogue-az]')
    var apis = []

    function renderRow (api) {
      return '<div class="govuk-!-margin-bottom-6">' +
        '<h2 class="govuk-heading-m govuk-!-margin-bottom-1">' +
          '<a class="govuk-link" href="' + detailUrl(api.name) + '">' + escapeHtml(api.title) + '</a>' +
        '</h2>' +
        '<p class="govuk-!-margin-bottom-2">' +
          '<span class="govuk-tag govuk-tag--blue app-tag--nowrap govuk-!-margin-right-1">' + escapeHtml(api.platform) + '</span>' +
          '<span class="govuk-tag govuk-tag--grey app-tag--nowrap govuk-!-margin-right-1">' + escapeHtml(api.domain) + '</span>' +
          '<span class="govuk-tag govuk-tag--green app-tag--nowrap">' + escapeHtml(api.status) + '</span>' +
        '</p>' +
        (api.description ? '<p class="govuk-body govuk-!-margin-bottom-1">' + escapeHtml(api.description) + '</p>' : '') +
        (api.team ? '<p class="govuk-hint govuk-!-margin-bottom-0">Maintained by ' + escapeHtml(api.team) + '</p>' : '') +
      '</div>'
    }

    // Only meaningful in browse mode (no search term): a jump-to-letter row
    // above the list, with every letter shown so the alphabet does not
    // visibly shrink and grow as APIs are added, but only present letters
    // are actual links.
    function renderAzNav (presentLetters) {
      var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      return '<nav class="app-az-nav" aria-label="Jump to a letter">' +
        '<ul class="app-az-nav__list">' +
        alphabet.map(function (letter) {
          return presentLetters.indexOf(letter) !== -1
            ? '<li><a class="app-az-nav__link" href="#az-' + letter + '">' + letter +
              '<span class="govuk-visually-hidden"> APIs</span></a></li>'
            : '<li><span class="app-az-nav__link app-az-nav__link--disabled" aria-hidden="true">' + letter + '</span></li>'
        }).join('') +
        '</ul></nav>'
    }

    function renderBrowse (list) {
      var groups = {}
      list.forEach(function (api) {
        var letter = (api.title.charAt(0) || '').toUpperCase()
        if (!/[A-Z]/.test(letter)) letter = '#'
        if (!groups[letter]) groups[letter] = []
        groups[letter].push(api)
      })

      var letters = Object.keys(groups).sort()

      if (azNavEl) azNavEl.innerHTML = renderAzNav(letters.filter(function (l) { return l !== '#' }))

      return letters.map(function (letter) {
        return '<h2 class="govuk-heading-l govuk-!-margin-top-6" id="az-' + letter + '">' + letter + '</h2>' +
          groups[letter].map(renderRow).join('')
      }).join('')
    }

    function render (filterText) {
      var term = (filterText || '').trim().toLowerCase()

      if (!term) {
        if (countEl) countEl.textContent = apis.length + ' API' + (apis.length === 1 ? '' : 's')
        root.innerHTML = apis.length ? renderBrowse(apis) : '<p class="govuk-body">No APIs are published yet.</p>'
        return
      }

      if (azNavEl) azNavEl.innerHTML = ''

      var matches = apis.filter(function (api) {
        return (api.title + ' ' + api.description + ' ' + api.team + ' ' + api.domain + ' ' + api.platform)
          .toLowerCase().indexOf(term) !== -1
      })

      if (countEl) {
        countEl.textContent = matches.length + ' API' + (matches.length === 1 ? '' : 's') +
          ' matching “' + filterText.trim() + '”'
      }

      root.innerHTML = matches.length
        ? matches.map(renderRow).join('')
        : '<p class="govuk-body">No APIs match your search.</p>'
    }

    root.innerHTML = '<p class="govuk-body">Loading the catalogue&hellip;</p>'

    fetchCatalogue()
      .then(function (result) {
        apis = result
        render(searchInput ? searchInput.value : '')
      })
      .catch(function () {
        if (countEl) countEl.textContent = ''
        root.innerHTML = '<p class="govuk-body">The catalogue could not be loaded right now. ' +
          '<a class="govuk-link" href="' + CATALOGUE_URL.replace('/apis.json', '/') + '">' +
          'Browse it directly at hmcts.github.io/amp-catalog</a>.</p>'
      })

    if (searchInput) {
      searchInput.addEventListener('input', function () { render(searchInput.value) })
    }
  }

  // --------------------------------------------------------- detail page
  //
  // HTTP methods rendered as govuk-tag colours, matching no established
  // convention (the Design System has no opinion here) but kept internally
  // consistent and colour-independent of meaning elsewhere on the site.
  var METHOD_TAG_COLOUR = {
    get: 'blue', post: 'green', put: 'turquoise', patch: 'purple', delete: 'red'
  }

  function methodTag (method) {
    var colour = METHOD_TAG_COLOUR[method] || 'grey'
    return '<strong class="govuk-tag govuk-tag--' + colour + '">' + method.toUpperCase() + '</strong>'
  }

  function renderOverview (api) {
    var rows = [
      ['Maintained by', escapeHtml(api.team || 'Not stated')],
      ['Repository', '<a class="govuk-link" href="' + api.repoUrl + '">' + escapeHtml(api.name) + '</a>'],
      ['Documentation', '<a class="govuk-link" href="' + api.docsUrl + '">' + escapeHtml(api.docsUrl) + '</a>']
    ]
    return '<p class="govuk-body">' + (escapeHtml(api.description) || 'No description available.') + '</p>' +
      '<div id="apiOverviewExtra"></div>' +
      '<dl class="govuk-summary-list">' +
      rows.map(function (r) {
        return '<div class="govuk-summary-list__row">' +
          '<dt class="govuk-summary-list__key">' + r[0] + '</dt>' +
          '<dd class="govuk-summary-list__value">' + r[1] + '</dd>' +
        '</div>'
      }).join('') +
      '</dl>' +
      // The one default (green) button on this page - the Design System is
      // explicit that a page should have at most one, and requesting access
      // is the more consequential next step for a consumer than opening
      // documentation, so that button (Try it out tab) is secondary instead.
      // Signed-out visitors are sent to sign in first and back here
      // afterwards, the same data-requires-auth handling every other link to
      // this form relies on (see get-started/request-api/index.html and
      // app/assets/javascripts/auth.js) - this is a plain link needing no
      // gating logic of its own.
      '<a class="govuk-button" id="requestApiAccess" href="' + requestApiUrl() + '">Request API access</a>'
  }

  // The catalogue feed only gives a one-line description. The spec's own
  // info.description is written by the API team and is often several
  // paragraphs of real plain-English detail - what the API is for, what it
  // deliberately does not do, who it is aimed at. Shown as a supplement to
  // the short description, not a replacement, and skipped entirely if it is
  // blank or just repeats what is already on screen.
  function renderExtendedDescription (api, spec) {
    var raw = ((spec && spec.info) || {}).description
    if (!raw || !raw.trim()) return ''
    if (raw.trim().toLowerCase() === (api.description || '').trim().toLowerCase()) return ''

    var paragraphs = raw.trim().split(/\n\s*\n/).filter(function (p) { return p.trim() })
    var body = paragraphs.length
      ? paragraphs.map(function (p) {
        return '<p class="govuk-body">' + escapeHtml(p.trim().replace(/\s*\n\s*/g, ' ')) + '</p>'
      }).join('')
      : '<p class="govuk-body">' + escapeHtml(raw.trim()) + '</p>'

    return '<h2 class="govuk-heading-m">What this API does</h2>' + body
  }

  function renderEndpoints (spec) {
    var paths = (spec && spec.paths) || {}
    var pathKeys = Object.keys(paths)
    var methods = ['get', 'post', 'put', 'patch', 'delete']

    var rows = []
    pathKeys.forEach(function (path) {
      var ops = paths[path] || {}
      methods.forEach(function (method) {
        if (!ops[method]) return
        rows.push({ method: method, path: path, op: ops[method] })
      })
    })

    if (!rows.length) return '<p class="govuk-body">No endpoints are defined in this specification.</p>'

    return '<p class="govuk-body">' + rows.length + ' endpoint' + (rows.length === 1 ? '' : 's') + '.</p>' +
      rows.map(function (r) {
        var params = (r.op.parameters || []).filter(function (p) { return p.in === 'path' })
        return '<div class="govuk-!-margin-bottom-4">' +
          '<p class="govuk-body govuk-!-margin-bottom-1">' + methodTag(r.method) +
            ' <code>' + escapeHtml(r.path) + '</code></p>' +
          (r.op.summary ? '<p class="govuk-body govuk-!-margin-bottom-1"><strong>' + escapeHtml(r.op.summary) + '</strong></p>' : '') +
          (r.op.description ? '<p class="govuk-body govuk-!-margin-bottom-1">' + escapeHtml(r.op.description) + '</p>' : '') +
          (params.length ? '<p class="govuk-hint govuk-!-margin-bottom-0">Path parameters: ' +
            params.map(function (p) { return '<code>' + escapeHtml(p.name) + '</code>' }).join(', ') + '</p>' : '') +
        '</div>'
      }).join('')
  }

  function renderDataModel (spec) {
    var schemas = ((spec && spec.components) || {}).schemas || {}
    var schemaKeys = Object.keys(schemas)

    if (!schemaKeys.length) return '<p class="govuk-body">No data model is defined in this specification.</p>'

    return schemaKeys.map(function (name) {
      var schema = schemas[name]
      var props = schema.properties || {}
      var propKeys = Object.keys(props)

      var table = !propKeys.length
        ? '<p class="govuk-body">No properties defined.</p>'
        : '<div class="app-table-wrapper" tabindex="0" role="region" aria-label="Properties of ' + escapeHtml(name) + '">' +
          '<table class="govuk-table">' +
            '<thead class="govuk-table__head"><tr class="govuk-table__row">' +
              '<th class="govuk-table__header" scope="col">Property</th>' +
              '<th class="govuk-table__header" scope="col">Type</th>' +
              '<th class="govuk-table__header" scope="col">Description</th>' +
            '</tr></thead>' +
            '<tbody class="govuk-table__body">' +
            propKeys.map(function (key) {
              var prop = props[key]
              var type = prop.type || (prop['$ref'] ? 'object' : '—')
              return '<tr class="govuk-table__row">' +
                '<td class="govuk-table__cell"><code>' + escapeHtml(key) + '</code></td>' +
                '<td class="govuk-table__cell">' + escapeHtml(type) + '</td>' +
                '<td class="govuk-table__cell">' + escapeHtml(prop.description || '') + '</td>' +
              '</tr>'
            }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>'

      return '<h3 class="govuk-heading-s">' + escapeHtml(name) +
        (schema.description ? ' <span class="govuk-hint">' + escapeHtml(schema.description) + '</span>' : '') +
        '</h3>' + table
    }).join('')
  }

  function renderChangelog (api, spec) {
    var info = (spec && spec.info) || {}
    return '<div class="govuk-!-margin-bottom-4">' +
      '<p class="govuk-body govuk-!-margin-bottom-1"><strong class="govuk-tag govuk-tag--blue">v' +
        escapeHtml(info.version || 'latest') + '</strong></p>' +
      '<p class="govuk-body">' + (escapeHtml(info.description) || 'No release notes are available.') + '</p>' +
    '</div>' +
    '<p class="govuk-body">This reflects the current specification only, not release history. ' +
      'See <a class="govuk-link" href="' + api.repoUrl + '">the repository</a> for past releases.</p>'
  }

  function renderTryIt (api) {
    return '<p class="govuk-body">Interactive documentation for this API, including request and response ' +
      'examples, is hosted with the API itself.</p>' +
      // Secondary, not the default green button - requesting access
      // (Overview tab) is the more consequential action on this page, and
      // the Design System asks for at most one default button per page.
      '<a class="govuk-button govuk-button--secondary" href="' + api.docsUrl + '">Open API documentation</a>'
  }

  function specUnavailable (api, detail) {
    var message = '<p class="govuk-body">The specification could not be loaded' +
      (detail ? ' (' + escapeHtml(detail) + ')' : '') + '. ' +
      '<a class="govuk-link" href="' + api.repoUrl + '">View the repository directly</a>.</p>'
    return message
  }

  function setPanels (html) {
    ;['apiEndpoints', 'apiDataModel', 'apiChangelog'].forEach(function (id) {
      var el = document.getElementById(id)
      if (el) el.innerHTML = html
    })
  }

  function loadSpec (api) {
    var endpointsEl = document.getElementById('apiEndpoints')
    var dataModelEl = document.getElementById('apiDataModel')
    var changelogEl = document.getElementById('apiChangelog')
    var loading = '<p class="govuk-body">Loading&hellip;</p>'
    if (endpointsEl) endpointsEl.innerHTML = loading
    if (dataModelEl) dataModelEl.innerHTML = loading
    if (changelogEl) changelogEl.innerHTML = loading

    fetch(api.specUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.text()
      })
      .then(function (yamlText) {
        var spec
        try {
          spec = window.jsyaml ? window.jsyaml.load(yamlText) : null
        } catch (err) {
          throw new Error('could not parse specification')
        }
        if (!spec) throw new Error('js-yaml unavailable')

        if (endpointsEl) endpointsEl.innerHTML = renderEndpoints(spec)
        if (dataModelEl) dataModelEl.innerHTML = renderDataModel(spec)
        if (changelogEl) changelogEl.innerHTML = renderChangelog(api, spec)

        var overviewExtraEl = document.getElementById('apiOverviewExtra')
        if (overviewExtraEl) overviewExtraEl.innerHTML = renderExtendedDescription(api, spec)
      })
      .catch(function (err) {
        setPanels(specUnavailable(api, err && err.message))
      })
  }

  function initDetail () {
    var shell = document.querySelector('[data-catalogue-detail]')
    var tabs = document.querySelector('[data-catalogue-tabs]')
    if (!shell) return

    var params = new window.URLSearchParams(window.location.search)
    var apiName = params.get('api')

    if (!apiName) {
      shell.innerHTML = '<p class="govuk-body">No API was specified. ' +
        '<a class="govuk-link" href="' + catalogueUrl() + '">Return to the catalogue</a>.</p>'
      if (tabs) tabs.hidden = true
      return
    }

    fetchCatalogue()
      .then(function (apis) {
        var api = apis.filter(function (a) { return a.name === apiName })[0]
        if (!api) throw new Error('not found')

        var heading = document.getElementById('apiTitle')
        if (heading) heading.textContent = api.title
        document.title = document.title.replace('API catalogue', api.title)

        shell.hidden = true
        if (tabs) tabs.hidden = false

        var overviewPanel = document.getElementById('apiOverview')
        if (overviewPanel) overviewPanel.innerHTML = renderOverview(api)

        // Remembers which API they came here for, so the request form (once
        // they land on it - straight away, or via a sign-in detour first,
        // both of which sessionStorage survives) can preselect it rather
        // than making them find it again in the dropdown.
        var requestApiLink = document.getElementById('requestApiAccess')
        if (requestApiLink) {
          requestApiLink.addEventListener('click', function () {
            try { window.sessionStorage.setItem('requestApiPreselect', api.name) } catch (e) { /* private browsing, etc. */ }
          })
        }

        var tryItPanel = document.getElementById('apiTryIt')
        if (tryItPanel) tryItPanel.innerHTML = renderTryIt(api)

        loadSpec(api)
      })
      .catch(function () {
        shell.innerHTML = '<p class="govuk-body">This API could not be found in the catalogue. ' +
          '<a class="govuk-link" href="' + catalogueUrl() + '">Return to the catalogue</a>.</p>'
        if (tabs) tabs.hidden = true
      })
  }

  document.addEventListener('DOMContentLoaded', function () {
    initListing()
    initDetail()
  })
})()
