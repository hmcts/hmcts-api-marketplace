// Real authentication against the deployed auth backend.
//
// This intentionally does not use the generic data-journey engine in
// application.js: that engine is sessionStorage-only by design (no server, no
// real submission - see its own comments), which is right for every other
// form in this prototype but wrong here, since these three pages genuinely
// sign a user in against a real API rather than faking a journey.
//
// Superseding ADR 0003 for /sign-in, /register and /account only - see the
// PR description and scripts/check-structure.mjs for the corresponding gate
// change.
(function () {
  'use strict'

  var API_BASE = 'https://hmcts-api-marketplace-auth-vu5d.onrender.com'
  var TOKEN_KEY = 'hmctsMarketplaceToken'

  // The site is served from a subdirectory on GitHub Pages
  // (hmcts.github.io/hmcts-api-marketplace/v2/) but from the domain root in
  // local dev (localhost:3100). A hardcoded "/account" resolves against the
  // domain root either way, which is wrong on Pages. Deriving the site's base
  // from where this very script was loaded from works in both places, the
  // same way export-static.mjs depth-corrects href/src in the exported HTML -
  // this covers the cases that rewrite (HTML only) does not reach.
  var SITE_BASE = (function () {
    var script = document.currentScript
    if (!script || !script.src) return '/'
    return script.src.replace(/public\/javascripts\/auth\.js(?:[?#].*)?$/, '')
  })()

  function siteUrl (route) {
    return SITE_BASE + route.replace(/^\//, '')
  }

  function getToken () {
    try { return window.localStorage.getItem(TOKEN_KEY) } catch (e) { return null }
  }
  function setToken (token) {
    try { window.localStorage.setItem(TOKEN_KEY, token) } catch (e) { /* private browsing, etc. */ }
  }
  function clearToken () {
    try { window.localStorage.removeItem(TOKEN_KEY) } catch (e) { /* as above */ }
  }

  function authedFetch (path, options) {
    options = options || {}
    var headers = options.headers || {}
    var token = getToken()
    if (token) headers.Authorization = 'Bearer ' + token
    options.headers = headers
    return window.fetch(API_BASE + path, options)
  }

  window.HmctsAuth = {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    apiBase: API_BASE,
    siteUrl: siteUrl,
    authedFetch: authedFetch
  }

  function showFormError (summaryId, linkId, target, message) {
    var summary = document.getElementById(summaryId)
    if (!summary) return
    var link = document.getElementById(linkId)
    if (link) {
      link.textContent = message
      if (target) link.setAttribute('href', '#' + target)
    }
    summary.hidden = false
    summary.focus()
  }

  function hideFormError (summaryId) {
    var summary = document.getElementById(summaryId)
    if (summary) summary.hidden = true
  }

  function setButtonBusy (button, busyText) {
    button.disabled = true
    button.dataset.originalText = button.textContent
    button.textContent = busyText
  }
  function clearButtonBusy (button) {
    button.disabled = false
    if (button.dataset.originalText) button.textContent = button.dataset.originalText
  }

  // Where to send a user once they have signed in. Only a plain site-relative
  // route (letters, digits, hyphens, slashes) is accepted, never a full URL or
  // anything with ".." - this value comes straight off the query string, and
  // siteUrl() would otherwise turn an attacker-supplied absolute URL into a
  // real redirect off the site.
  function nextRoute () {
    var match = window.location.search.match(/[?&]next=([^&]+)/)
    var next = match && decodeURIComponent(match[1])
    return next && /^[\w-]+(\/[\w-]+)*\/?$/.test(next) ? next : 'account/'
  }

  // ---- sign-in page: carry the "return to" destination through to register -
  // A signed-out visitor sent here by a data-requires-auth redirect (e.g.
  // from Request API access) should still get taken back to that page after
  // registering, the same as after signing in - not dropped on their new
  // account page instead, regardless of which of the two they choose here.
  var registerLink = document.getElementById('register-link')
  if (registerLink) {
    registerLink.setAttribute('href', registerLink.getAttribute('href') + '?next=' + encodeURIComponent(nextRoute()))
  }

  // ---- site-wide: send signed-out visitors to sign in first ---------------
  // A page marks itself with a hidden data-requires-auth element carrying the
  // route to return to once signed in - see get-started/request-api/*.
  var authGate = document.querySelector('[data-requires-auth]')
  if (authGate && !getToken()) {
    var returnTo = authGate.getAttribute('data-requires-auth')
    window.location.href = siteUrl('sign-in/') + '?next=' + encodeURIComponent(returnTo)
  }

  // ---- site-wide: reflect signed-in state in the service navigation -------
  var navAuthLink = document.getElementById('nav-auth-link')
  if (navAuthLink) {
    var token = getToken()
    if (token) {
      authedFetch('/api/me').then(function (res) {
        if (!res.ok) { clearToken(); return }
        navAuthLink.textContent = 'Your account'
        navAuthLink.setAttribute('href', siteUrl('account/'))

        // Homepage only: once we know someone is signed in, the sign-in/
        // register prompt there is not just redundant but actively
        // confusing next to "Your account" in the header - swap it for a way
        // into the account they already have.
        var homeAuthPrompt = document.getElementById('home-auth-prompt')
        var homeAccountPrompt = document.getElementById('home-account-prompt')
        if (homeAuthPrompt && homeAccountPrompt) {
          homeAuthPrompt.hidden = true
          homeAccountPrompt.hidden = false
        }
      }).catch(function () { /* nav still shows "Sign in" - fine */ })
    }
  }

  // ---- sign in --------------------------------------------------------------
  var signInForm = document.getElementById('signin-form')
  if (signInForm) {
    signInForm.addEventListener('submit', function (event) {
      event.preventDefault()
      hideFormError('signin-error-summary')

      var email = document.getElementById('signin-email').value.trim()
      var password = document.getElementById('signin-password').value

      if (!email || !password) {
        showFormError('signin-error-summary', 'signin-error-link', 'signin-email', 'Enter your email address and password')
        return
      }

      var button = document.getElementById('signin-submit')
      setButtonBusy(button, 'Signing in…')

      window.fetch(API_BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data } })
      }).then(function (result) {
        if (!result.ok) {
          clearButtonBusy(button)
          showFormError('signin-error-summary', 'signin-error-link', 'signin-email', result.data.error || 'Enter a valid email address and password')
          return
        }
        setToken(result.data.token)
        window.location.href = siteUrl(nextRoute())
      }).catch(function () {
        clearButtonBusy(button)
        showFormError('signin-error-summary', 'signin-error-link', 'signin-email', 'Could not reach the sign-in service. Try again in a moment.')
      })
    })
  }

  // ---- register ---------------------------------------------------------
  var registerForm = document.getElementById('register-form')
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault()
      hideFormError('register-error-summary')

      var firstName = document.getElementById('reg-first-name').value.trim()
      var lastName = document.getElementById('reg-last-name').value.trim()
      var email = document.getElementById('reg-email').value.trim()
      var organisation = document.getElementById('reg-organisation').value.trim()
      var roleInput = registerForm.querySelector('input[name="role"]:checked')
      var password = document.getElementById('reg-password').value
      var passwordConfirm = document.getElementById('reg-password-confirm').value

      if (!firstName || !lastName || !email || !organisation || !roleInput || !password) {
        showFormError('register-error-summary', 'register-error-link', 'reg-first-name', 'Fill in all required fields')
        return
      }
      if (password.length < 12) {
        showFormError('register-error-summary', 'register-error-link', 'reg-password', 'Your password must be at least 12 characters long')
        return
      }
      if (password !== passwordConfirm) {
        showFormError('register-error-summary', 'register-error-link', 'reg-password-confirm', 'Your passwords do not match')
        return
      }

      var button = document.getElementById('register-submit')
      setButtonBusy(button, 'Creating account…')

      window.fetch(API_BASE + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          organisation: organisation,
          role: roleInput.value,
          password: password
        })
      }).then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data } })
      }).then(function (result) {
        if (!result.ok) {
          clearButtonBusy(button)
          showFormError('register-error-summary', 'register-error-link', 'reg-email', result.data.error || 'Something went wrong. Please try again.')
          return
        }
        setToken(result.data.token)
        window.location.href = siteUrl(nextRoute())
      }).catch(function () {
        clearButtonBusy(button)
        showFormError('register-error-summary', 'register-error-link', 'reg-email', 'Could not reach the registration service. Try again in a moment.')
      })
    })
  }

  // ---- account ------------------------------------------------------------
  var accountDetails = document.getElementById('account-details')
  if (accountDetails) {
    var accountToken = getToken()
    if (!accountToken) {
      window.location.href = siteUrl('sign-in/')
    } else {
      authedFetch('/api/me').then(function (res) {
        if (!res.ok) {
          clearToken()
          window.location.href = siteUrl('sign-in/')
          return
        }
        return res.json().then(function (data) {
          // The backend accepts "organisation" at registration but does not
          // currently return it from /api/register, /api/login or /api/me -
          // confirmed against the deployed API, not assumed - so it has no
          // row here. See the PR description.
          document.getElementById('account-name').textContent = data.user.firstName + ' ' + data.user.lastName
          document.getElementById('account-email').textContent = data.user.email
          document.getElementById('account-role').textContent = data.user.role === 'producer' ? 'Producer' : 'Consumer'
          document.getElementById('account-loading').hidden = true
          accountDetails.hidden = false
          var signOutForm = document.getElementById('signout-form')
          if (signOutForm) signOutForm.hidden = false
        })
      }).catch(function () {
        document.getElementById('account-loading').textContent = 'Could not load your account details. Try again in a moment.'
      })
    }

    var signOutForm = document.getElementById('signout-form')
    if (signOutForm) {
      signOutForm.addEventListener('submit', function (event) {
        event.preventDefault()
        authedFetch('/api/logout', { method: 'POST' }).catch(function () { /* clear the local token regardless */ })
        clearToken()
        window.location.href = siteUrl('sign-in/')
      })
    }
  }
})()
