// Real submission and dashboard listing for the three "ask the marketplace
// team for something" forms - request API access, publish an API, request a
// new API - against the same backend and token as auth.js and applications.js.
//
// Wrapped in DOMContentLoaded for the same reason as applications.js: this
// script (loaded via pageScripts) runs before auth.js in document order, so
// window.HmctsAuth would be undefined at top level.
//
// Each form's check-answers page has an "Accept and submit" form with its own
// id and deliberately no data-journey attribute, so application.js's generic
// data-journey handler never touches it - only this script does. The generic
// handler already ran once, on the form before check-answers, and saved the
// raw answers to sessionStorage under journey:<name>; this script reads them
// back, POSTs them for real, and only then advances to confirmation.
document.addEventListener('DOMContentLoaded', function () {
  'use strict'

  var Auth = window.HmctsAuth
  if (!Auth) return

  var KIND_LABELS = {
    'access-request': 'Request API access',
    'publish-api': 'Publish an API',
    'new-api': 'Request a new API'
  }

  // journey matches the data-journey name on the form before check-answers,
  // which is also the sessionStorage key this script reads the answers back
  // from. confirmation is where the form's own confirmation page lives,
  // relative to the site root, matching how Auth.siteUrl expects routes.
  var SUBMIT_FORMS = [
    { formId: 'access-request-submit-form', journey: 'request-api', kind: 'access-request', confirmation: 'get-started/request-api/confirmation/' },
    { formId: 'publish-submit-submit-form', journey: 'publish-submit', kind: 'publish-api', confirmation: 'publish/submit/confirmation/' },
    { formId: 'new-api-submit-form', journey: 'request-new-api', kind: 'new-api', confirmation: 'api-catalogue/request-new-api/confirmation/' }
  ]

  function requireSignedIn () {
    if (Auth.getToken()) return true
    window.location.href = Auth.siteUrl('sign-in/')
    return false
  }

  function readJourneyAnswers (journey) {
    var raw
    try {
      raw = JSON.parse(window.sessionStorage.getItem('journey:' + journey)) || []
    } catch (e) {
      raw = []
    }
    var details = {}
    raw.forEach(function (a) { details[a.name] = a.value })
    return details
  }

  function escapeHtml (str) {
    var div = document.createElement('div')
    div.textContent = str == null ? '' : String(str)
    return div.innerHTML
  }

  function formatDate (iso) {
    var d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ---- check answers: real submission --------------------------------

  SUBMIT_FORMS.forEach(function (config) {
    var form = document.getElementById(config.formId)
    if (!form) return
    if (!requireSignedIn()) return

    form.addEventListener('submit', function (event) {
      event.preventDefault()

      var summary = document.getElementById('request-error-summary')
      var link = document.getElementById('request-error-link')
      var button = form.querySelector('.govuk-button')

      function showError (message) {
        if (button) {
          button.disabled = false
          if (button.dataset.originalText) button.textContent = button.dataset.originalText
        }
        if (!summary || !link) return
        link.textContent = message
        link.setAttribute('href', '../')
        summary.hidden = false
        summary.focus()
      }

      var details = readJourneyAnswers(config.journey)
      if (!Object.keys(details).length) {
        showError('Your answers could not be read back. Go back and fill in the form again.')
        return
      }

      if (button) {
        button.disabled = true
        button.dataset.originalText = button.textContent
        button.textContent = 'Submitting…'
      }

      Auth.authedFetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: config.kind, details: details })
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data } })
      }).then(function (result) {
        if (!result.ok) {
          showError(result.data.error || 'Something went wrong. Please try again.')
          return
        }

        try {
          window.sessionStorage.setItem('submittedRequest', JSON.stringify(result.data.request))
        } catch (e) { /* private browsing, etc - confirmation page has a fallback */ }

        window.location.href = Auth.siteUrl(config.confirmation)
      }).catch(function () {
        showError('Could not reach the requests service. Try again in a moment.')
      })
    })
  })

  // ---- confirmation: show the real reference -------------------------

  var confirmationRefEl = document.getElementById('confirmation-reference')
  if (confirmationRefEl) {
    var submitted = null
    try { submitted = JSON.parse(window.sessionStorage.getItem('submittedRequest')) } catch (e) {}

    if (!submitted) {
      var fallback = document.getElementById('confirmation-fallback')
      if (fallback) fallback.hidden = false
      var panel = document.querySelector('.govuk-panel')
      if (panel) panel.hidden = true
    } else {
      confirmationRefEl.textContent = submitted.reference
      try { window.sessionStorage.removeItem('submittedRequest') } catch (e) {}
    }
  }

  // ---- dashboard: my requests -----------------------------------------

  var requestsTable = document.getElementById('requests-table')
  if (requestsTable) {
    if (!requireSignedIn()) return

    Auth.authedFetch('/api/requests').then(function (res) {
      if (res.status === 401) { window.location.href = Auth.siteUrl('sign-in/'); return }
      return res.json()
    }).then(function (data) {
      if (!data) return
      var body = document.getElementById('requests-table-body')
      var loading = document.getElementById('requests-loading')
      var empty = document.getElementById('requests-empty-hint')
      loading.hidden = true

      if (!data.requests.length) {
        empty.hidden = false
        return
      }

      requestsTable.hidden = false
      data.requests.forEach(function (r) {
        var tr = document.createElement('tr')
        tr.className = 'govuk-table__row'
        tr.innerHTML =
          '<td class="govuk-table__cell">' + escapeHtml(r.reference) + '</td>' +
          '<td class="govuk-table__cell">' + escapeHtml(KIND_LABELS[r.kind] || r.kind) + '</td>' +
          '<td class="govuk-table__cell">' + escapeHtml(formatDate(r.createdAt)) + '</td>' +
          '<td class="govuk-table__cell"><strong class="govuk-tag govuk-tag--blue">' + escapeHtml(r.status) + '</strong></td>'
        body.appendChild(tr)
      })
    }).catch(function () {
      document.getElementById('requests-loading').textContent = 'Could not load your requests. Try again in a moment.'
    })
  }

  // ---- request-api form: populate the API dropdown from the live catalogue -
  //
  // Reads the same feed the API catalogue itself lists (catalogue-data.js),
  // so this always offers exactly the APIs actually published, with no
  // separately-maintained list to fall out of step with the real catalogue.
  // No visible error state for now if the feed cannot be reached - the field
  // just stays at "Choose an API" and the required-field check on submit
  // catches it the same way it would if someone left it alone anyway.
  var apiNameSelect = document.getElementById('api-name')
  if (apiNameSelect && window.HmctsCatalogue) {
    window.HmctsCatalogue.fetchCatalogue().then(function (apis) {
      apis.forEach(function (api) {
        var option = document.createElement('option')
        option.value = api.name
        option.textContent = api.title
        apiNameSelect.appendChild(option)
      })

      // Set by the Request API access button on an API's own detail page
      // (api-catalogue.js) - single-use, so a stale value left over from
      // browsing a different API earlier never resurfaces on some later,
      // unrelated visit to this form.
      var preselect = null
      try { preselect = window.sessionStorage.getItem('requestApiPreselect') } catch (e) { /* private browsing, etc. */ }
      if (preselect) {
        try { window.sessionStorage.removeItem('requestApiPreselect') } catch (e) {}
        apiNameSelect.value = preselect
      }
    }).catch(function () {})
  }
})
