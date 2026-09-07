/* global window, fetch */

//
// Fetching and shaping the live API catalogue feed - shared by the catalogue
// listing/detail pages (api-catalogue.js) and anywhere else that needs to
// know what APIs currently exist, such as the Request API access form's
// dropdown. Pulled out on its own specifically so that dropdown reads the
// same live list this fetches for the catalogue itself, rather than a second,
// separately-maintained copy that silently drifts from what is actually
// published. See design/adr/0005-in-repo-api-catalogue.md for why the feed
// lives outside this repo at all.
//

(function () {
  'use strict'

  var CATALOGUE_URL = 'https://hmcts.github.io/amp-catalog/apis.json'
  var GITHUB_ORG = 'hmcts'
  var SPEC_PATH = '/main/src/main/resources/openapi/openapi-spec.yml'

  function deriveLinks (name) {
    return {
      repoUrl: 'https://github.com/' + GITHUB_ORG + '/' + name,
      docsUrl: 'https://hmcts.github.io/' + name + '/',
      specUrl: 'https://raw.githubusercontent.com/' + GITHUB_ORG + '/' + name + '/' + SPEC_PATH.replace(/^\//, '')
    }
  }

  // The catalogue feed carries no domain, classification or status fields -
  // just name, title, description and team (see ADR 0005). Two tags are
  // shown anyway, each honest about what it actually is:
  //
  //   Domain  - a topic guessed from the repo name, for browsing only. Not
  //             an authoritative classification, and styled as a neutral
  //             grey tag rather than anything that reads as official.
  //   Status  - always "Published". Not a lifecycle claim (we have no signal
  //             for Alpha/Beta/Live) - just the one true thing this page can
  //             say about anything it successfully fetched: it is in the
  //             live catalogue right now.
  //
  // Ordered, first match wins. Checked against every API in the feed at the
  // time this was written; a name that matches nothing falls back to
  // "Other" rather than a wrong guess.
  var DOMAIN_RULES = [
    [/^api-cp-ai-/, 'AI'],
    [/^api-cp-refdata-/, 'Reference data'],
    [/prosecution-case|results-pcr|caseadmin|defendant/, 'Case administration'],
    [/scheduling|listing|court-list/, 'Scheduling and listing'],
    [/hearing/, 'Hearings']
  ]

  function inferDomain (name) {
    for (var i = 0; i < DOMAIN_RULES.length; i++) {
      if (DOMAIN_RULES[i][0].test(name)) return DOMAIN_RULES[i][1]
    }
    return 'Other'
  }

  // Which case management platform an API's data comes from - Common
  // Platform (crime) today, everything else "Other" until a repo actually
  // shows up with a different prefix. Every API in the feed at the time
  // this was written is api-cp-*, so this is a confirmed read of that
  // prefix, not a guess - but there is no real example of a CFT (or any
  // other) API yet to check a second prefix against, so one is not invented
  // here. Extend PLATFORM_RULES, the same shape as DOMAIN_RULES, once one
  // exists.
  var PLATFORM_RULES = [
    [/^api-cp-/, 'Common Platform']
  ]

  function inferPlatform (name) {
    for (var i = 0; i < PLATFORM_RULES.length; i++) {
      if (PLATFORM_RULES[i][0].test(name)) return PLATFORM_RULES[i][1]
    }
    return 'Other'
  }

  function fetchCatalogue () {
    return fetch(CATALOGUE_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        return res.json()
      })
      .then(function (data) {
        var apis = (data && data.apis) || []
        return apis.map(function (api) {
          var links = deriveLinks(api.name)
          return {
            name: api.name,
            title: api.title || api.name,
            description: api.description || '',
            team: api.team || '',
            domain: inferDomain(api.name),
            platform: inferPlatform(api.name),
            status: 'Published',
            repoUrl: links.repoUrl,
            docsUrl: links.docsUrl,
            specUrl: links.specUrl
          }
        }).sort(function (a, b) { return a.title.localeCompare(b.title) })
      })
  }

  window.HmctsCatalogue = { fetchCatalogue: fetchCatalogue }
})()
