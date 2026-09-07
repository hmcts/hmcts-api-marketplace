// HMCTS API Marketplace — shared behaviour

document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
  }

  // Generic tabs (API detail page)
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var buttons = group.querySelectorAll('.detail-tabs button');
    var panels = group.querySelectorAll('.tab-panel');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var target = group.querySelector('#' + btn.getAttribute('data-target'));
        if (target) target.classList.add('active');
      });
    });
  });

  // Catalogue search + filter
  var searchInput = document.getElementById('catalogue-search');
  var cards = document.querySelectorAll('.api-card');
  var resultsMeta = document.getElementById('results-meta');
  var checkboxFilters = document.querySelectorAll('.filters input[type=checkbox]');

  function applyFilters() {
    var query = (searchInput && searchInput.value || '').toLowerCase().trim();
    var activeDomains = Array.from(document.querySelectorAll('.filters input[data-group=domain]:checked')).map(function (c) { return c.value; });
    var activeStatus = Array.from(document.querySelectorAll('.filters input[data-group=status]:checked')).map(function (c) { return c.value; });
    var activeClass = Array.from(document.querySelectorAll('.filters input[data-group=classification]:checked')).map(function (c) { return c.value; });

    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var domain = card.getAttribute('data-domain');
      var status = card.getAttribute('data-status');
      var cls = card.getAttribute('data-classification');

      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesDomain = activeDomains.length === 0 || activeDomains.indexOf(domain) !== -1;
      var matchesStatus = activeStatus.length === 0 || activeStatus.indexOf(status) !== -1;
      var matchesClass = activeClass.length === 0 || activeClass.indexOf(cls) !== -1;

      if (matchesQuery && matchesDomain && matchesStatus && matchesClass) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (resultsMeta) {
      resultsMeta.textContent = 'Showing ' + visible + ' of ' + cards.length + ' APIs';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    var searchForm = searchInput.closest('form');
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });
  }
  checkboxFilters.forEach(function (c) { c.addEventListener('change', applyFilters); });

  var resetLink = document.getElementById('reset-filters');
  if (resetLink) {
    resetLink.addEventListener('click', function (e) {
      e.preventDefault();
      checkboxFilters.forEach(function (c) { c.checked = false; });
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  // Forms: fake submit -> show confirmation, no network calls
  document.querySelectorAll('form[data-mock-submit]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var missing = false;
      requiredFields.forEach(function (f) {
        if (!f.value || (f.type === 'checkbox' && !f.checked)) missing = true;
      });

      var errorSummary = form.querySelector('.error-summary');
      if (missing) {
        if (errorSummary) errorSummary.classList.add('show');
        window.scrollTo({ top: form.offsetTop - 40, behavior: 'smooth' });
        return;
      }
      if (errorSummary) errorSummary.classList.remove('show');

      form.classList.add('hidden-after-submit');
      var confirmation = document.getElementById(form.getAttribute('data-mock-submit'));
      if (confirmation) {
        confirmation.classList.add('show');
        confirmation.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Sign in / Register tab switch
  document.querySelectorAll('[data-auth-tabs] button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-auth-tabs] button').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.auth-panel').forEach(function (p) { p.style.display = 'none'; });
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-target')).style.display = 'block';
    });
  });

  // Site-wide "am I signed in?" check, reflected in the header nav.
  // Runs on every regular page (not the auth pages themselves, which have
  // their own logic) so being signed in is visible no matter where you are.
  var navAuthLink = document.getElementById('nav-auth-link');
  if (navAuthLink) {
    var AUTH_API_BASE = 'https://hmcts-api-marketplace-auth.onrender.com';
    fetch(AUTH_API_BASE + '/api/me', { credentials: 'include' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return; // not signed in - leave the link as "Sign in"

        navAuthLink.textContent = 'My account (' + data.user.firstName + ')';
        navAuthLink.setAttribute('href', 'account.html');

        var signOutLi = document.createElement('li');
        var signOutLink = document.createElement('a');
        signOutLink.href = '#';
        signOutLink.textContent = 'Sign out';
        signOutLink.addEventListener('click', function (e) {
          e.preventDefault();
          fetch(AUTH_API_BASE + '/api/logout', { method: 'POST', credentials: 'include' })
            .catch(function () {})
            .then(function () { window.location.reload(); });
        });
        signOutLi.appendChild(signOutLink);
        navAuthLink.closest('li').insertAdjacentElement('afterend', signOutLi);
      })
      .catch(function () {
        // Auth server unreachable (e.g. still waking up on Render's free tier) -
        // fail quietly and just leave the link as "Sign in".
      });
  }

});
