// Real "environment access" dashboard, against the same backend and token
// as auth.js and applications.js. Wrapped in DOMContentLoaded for the same
// reason as those two: this script (loaded via pageScripts) runs before
// auth.js in document order, so window.HmctsAuth would be undefined at top
// level.
//
// Sandbox, development and integration test are self-service the moment an
// application exists - production is the only environment gated behind a
// reviewed request, mirroring how e.g. HMRC's Developer Hub splits sandbox
// (immediate) from production (apply, then wait for approval) credentials.
// There is no separate "production access" request kind on the backend, so
// requesting it reuses the existing Request API access journey - the same
// team reviews it either way.
document.addEventListener('DOMContentLoaded', function () {
  'use strict'

  var Auth = window.HmctsAuth
  if (!Auth) return

  var ENVIRONMENT_LABELS = {
    sandbox: 'Sandbox',
    development: 'Development',
    'integration-test': 'Integration test',
    production: 'Production'
  }

  var SELF_SERVICE_ENVIRONMENTS = ['sandbox', 'development', 'integration-test']

  // Groups an owner's applications by name, matching the same grouping on
  // My applications and teams - a sandbox and a production registration of
  // "the same" application show up together rather than as two unrelated
  // rows. Order follows first appearance, which is createdAt DESC from the API.
  function groupApplicationsByName (applications) {
    var order = []
    var groups = {}
    applications.forEach(function (app) {
      var key = app.name.toLowerCase()
      if (!groups[key]) {
        groups[key] = { name: app.name, apps: [] }
        order.push(key)
      }
      groups[key].apps.push(app)
    })
    return order.map(function (key) { return groups[key] })
  }

  function requireSignedIn () {
    if (Auth.getToken()) return true
    window.location.href = Auth.siteUrl('sign-in/')
    return false
  }

  function escapeHtml (str) {
    var div = document.createElement('div')
    div.textContent = str == null ? '' : String(str)
    return div.innerHTML
  }

  var envTable = document.getElementById('env-table')
  if (!envTable) return
  if (!requireSignedIn()) return

  Auth.authedFetch('/api/applications').then(function (res) {
    if (res.status === 401) { window.location.href = Auth.siteUrl('sign-in/'); return }
    return res.json()
  }).then(function (data) {
    if (!data) return
    var body = document.getElementById('env-table-body')
    var loading = document.getElementById('env-loading')
    var empty = document.getElementById('env-empty-hint')
    loading.hidden = true

    if (!data.applications.length) {
      empty.hidden = false
      return
    }

    envTable.hidden = false
    groupApplicationsByName(data.applications).forEach(function (group) {
      group.apps.forEach(function (app, index) {
        var tr = document.createElement('tr')
        tr.className = 'govuk-table__row'

        var selfService = SELF_SERVICE_ENVIRONMENTS.indexOf(app.environment) !== -1
        var status = selfService
          ? '<strong class="govuk-tag govuk-tag--green">Active</strong>'
          : '<strong class="govuk-tag govuk-tag--grey">Needs approval</strong>'
        var action = selfService
          ? '<a class="govuk-link" href="' + Auth.siteUrl('account/applications/detail/?id=' + encodeURIComponent(app.id)) + '">Manage credentials</a>'
          : '<a class="govuk-link" href="#" data-request-production="' + escapeHtml(app.id) + '" data-app-name="' + escapeHtml(app.name) + '">Request production access</a>'
        var nameCell = index === 0
          ? '<td class="govuk-table__cell" rowspan="' + group.apps.length + '"><strong>' + escapeHtml(group.name) + '</strong></td>'
          : ''

        tr.innerHTML =
          nameCell +
          '<td class="govuk-table__cell">' + escapeHtml(ENVIRONMENT_LABELS[app.environment] || app.environment) + '</td>' +
          '<td class="govuk-table__cell">' + status + '</td>' +
          '<td class="govuk-table__cell">' + action + '</td>'
        body.appendChild(tr)
      })

      var taken = group.apps.map(function (a) { return a.environment })
      var missing = Object.keys(ENVIRONMENT_LABELS).filter(function (env) { return taken.indexOf(env) === -1 })
      if (missing.length) {
        var addRow = document.createElement('tr')
        addRow.className = 'govuk-table__row'
        addRow.innerHTML = '<td class="govuk-table__cell" colspan="4">Add ' + escapeHtml(group.name) + ' in: ' +
          missing.map(function (env) {
            return '<a class="govuk-link" href="#" data-add-environment="' + escapeHtml(env) + '" data-app-name="' + escapeHtml(group.name) + '">' + escapeHtml(ENVIRONMENT_LABELS[env]) + '</a>'
          }).join(', ') + '</td>'
        body.appendChild(addRow)
      }
    })
  }).catch(function () {
    document.getElementById('env-loading').textContent = 'Could not load your applications. Try again in a moment.'
  })

  document.getElementById('env-table-body').addEventListener('click', function (event) {
    var link = event.target.closest('[data-request-production]')
    if (!link) return
    event.preventDefault()

    // Read once and cleared by requests.js on the request-api form - the
    // same single-use pattern as api-catalogue.js's own preselect, just
    // under a different sessionStorage key so the two never collide.
    try {
      window.sessionStorage.setItem('environmentAccessPreselect', JSON.stringify({
        useCaseNote: 'Requesting production access for application: ' + link.getAttribute('data-app-name')
      }))
    } catch (e) { /* private browsing, etc. */ }

    window.location.href = Auth.siteUrl('get-started/request-api/')
  })

  document.getElementById('env-table-body').addEventListener('click', function (event) {
    var link = event.target.closest('[data-add-environment]')
    if (!link) return
    event.preventDefault()

    // Read once and cleared by applications.js on the new-application form -
    // see applications.js for the matching single-use handling.
    try {
      window.sessionStorage.setItem('newApplicationPreselect', JSON.stringify({
        name: link.getAttribute('data-app-name'),
        environment: link.getAttribute('data-add-environment')
      }))
    } catch (e) { /* private browsing, etc. */ }

    window.location.href = Auth.siteUrl('account/applications/new/')
  })
})
