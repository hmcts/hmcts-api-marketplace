/* global window, document */

//
// Behaviour for the HMCTS API Marketplace prototype.
//
// Two responsibilities, both driven by data attributes so no page needs an
// inline script:
//
//   data-journey="<name>"        on a form - validate, store answers, advance
//   data-summary-for="<name>"    on a <dl>  - render stored answers back
//
// Answers are held in sessionStorage because the exported site is static and
// has no server session. They never leave the browser and are discarded when
// the tab closes. See /cookies and /privacy, which say exactly this.
//
// Without JavaScript every step still renders and reads correctly; it simply
// does not carry answers forward. The check-answers page says so.
//

(function () {
  'use strict'

  // ---------------------------------------------------------------- storage

  function storageKey (journey) {
    return 'journey:' + journey
  }

  function loadJourney (journey) {
    try {
      return JSON.parse(window.sessionStorage.getItem(storageKey(journey))) || []
    } catch (err) {
      return []
    }
  }

  function saveJourney (journey, answers) {
    try {
      window.sessionStorage.setItem(storageKey(journey), JSON.stringify(answers))
    } catch (err) {
      // Storage blocked or full. The journey still works, it just will not
      // remember answers - which is exactly the no-JavaScript behaviour.
    }
  }

  // ------------------------------------------------------------------ labels

  // The visible label for a control, so the check-answers page and the error
  // summary can use the same words the user read. Avoids maintaining a
  // duplicate map of field names to labels in JavaScript.
  function labelFor (control) {
    var fieldset = control.closest('fieldset')
    if (fieldset) {
      var legend = fieldset.querySelector('legend')
      if (legend) return legend.textContent.trim()
    }
    if (control.id) {
      var label = document.querySelector('label[for="' + control.id + '"]')
      if (label) return label.textContent.trim()
    }
    return control.name
  }

  function optionLabel (input) {
    var label = input.id ? document.querySelector('label[for="' + input.id + '"]') : null
    return label ? label.textContent.trim() : input.value
  }

  // ------------------------------------------------------------- collection

  // Walks the form in document order and returns [{name, label, value}].
  // Radio and checkbox groups collapse to one row each; a select's value is
  // its chosen option's visible text, not the option value attribute.
  function collectAnswers (form) {
    var answers = []
    var seenGroups = {}

    Array.prototype.forEach.call(form.elements, function (control) {
      if (!control.name || control.disabled || control.type === 'submit') return

      if (control.type === 'radio' || control.type === 'checkbox') {
        if (seenGroups[control.name]) return
        seenGroups[control.name] = true

        var group = form.querySelectorAll('[name="' + control.name + '"]')
        var chosen = []
        Array.prototype.forEach.call(group, function (input) {
          if (input.checked) chosen.push(optionLabel(input))
        })

        answers.push({
          name: control.name,
          label: labelFor(control),
          value: chosen.join(', ')
        })
        return
      }

      if (control.tagName === 'SELECT') {
        var selected = control.options[control.selectedIndex]
        answers.push({
          name: control.name,
          label: labelFor(control),
          value: selected ? selected.textContent.trim() : ''
        })
        return
      }

      answers.push({
        name: control.name,
        label: labelFor(control),
        value: control.value.trim()
      })
    })

    return answers
  }

  // ------------------------------------------------------------- validation

  // The GOV.UK error pattern: a summary at the top with links into the fields,
  // a message beside each field, and focus moved to the summary. This is what
  // the audit found missing (A-5) - a single generic "fill in all required
  // fields" with no per-field messages and no focus management.
  function validate (form) {
    var errors = []

    clearErrors(form)

    Array.prototype.forEach.call(form.querySelectorAll('[data-required]'), function (group) {
      var controls = group.querySelectorAll('input, select, textarea')
      var first = controls[0]
      if (!first) return

      var satisfied = false
      Array.prototype.forEach.call(controls, function (control) {
        if (control.type === 'radio' || control.type === 'checkbox') {
          if (control.checked) satisfied = true
        } else if (control.value.trim() !== '') {
          satisfied = true
        }
      })

      if (!satisfied) {
        errors.push({
          message: group.getAttribute('data-error') || 'Complete this field',
          target: first,
          group: group
        })
      }
    })

    if (errors.length) showErrors(form, errors)
    return errors.length === 0
  }

  // The error summary lives above the <h1>, per the GOV.UK error pattern, which
  // puts it OUTSIDE the form element. Looking it up with form.querySelector
  // therefore finds nothing - a bug worth a comment, because the per-field
  // messages still appear and the omission is easy to miss.
  function summaryFor (form) {
    var journey = form.getAttribute('data-journey')
    return document.querySelector('[data-error-summary="' + journey + '"]') ||
           document.querySelector('[data-error-summary]')
  }

  function clearErrors (form) {
    Array.prototype.forEach.call(form.querySelectorAll('.govuk-form-group--error'), function (group) {
      group.classList.remove('govuk-form-group--error')
    })
    Array.prototype.forEach.call(form.querySelectorAll('[data-generated-error]'), function (node) {
      node.parentNode.removeChild(node)
    })
    Array.prototype.forEach.call(form.querySelectorAll('.govuk-input--error, .govuk-select--error, .govuk-textarea--error'), function (control) {
      control.classList.remove('govuk-input--error', 'govuk-select--error', 'govuk-textarea--error')
    })

    var summary = summaryFor(form)
    if (summary) {
      summary.setAttribute('hidden', 'hidden')
      summary.innerHTML = ''
    }
  }

  function showErrors (form, errors) {
    var summary = summaryFor(form)

    errors.forEach(function (error) {
      var group = error.group.classList.contains('govuk-form-group')
        ? error.group
        : error.group.closest('.govuk-form-group') || error.group

      group.classList.add('govuk-form-group--error')

      var message = document.createElement('p')
      message.className = 'govuk-error-message'
      message.setAttribute('data-generated-error', 'true')
      message.innerHTML = '<span class="govuk-visually-hidden">Error:</span> ' + error.message

      var anchor = error.group.querySelector('fieldset') || error.target
      anchor.parentNode.insertBefore(message, anchor)

      if (error.target.tagName === 'INPUT' && error.target.type === 'text') {
        error.target.classList.add('govuk-input--error')
      } else if (error.target.tagName === 'SELECT') {
        error.target.classList.add('govuk-select--error')
      } else if (error.target.tagName === 'TEXTAREA') {
        error.target.classList.add('govuk-textarea--error')
      }
    })

    if (summary) {
      var items = errors.map(function (error) {
        var id = error.target.id || ''
        return '<li><a href="#' + id + '">' + error.message + '</a></li>'
      }).join('')

      summary.innerHTML =
        '<div class="govuk-error-summary" data-module="govuk-error-summary">' +
        '  <div role="alert">' +
        '    <h2 class="govuk-error-summary__title">There is a problem</h2>' +
        '    <div class="govuk-error-summary__body"><ul class="govuk-list govuk-error-summary__list">' +
        items +
        '    </ul></div>' +
        '  </div>' +
        '</div>'

      summary.removeAttribute('hidden')
      summary.setAttribute('tabindex', '-1')
      summary.focus()
    }
  }

  // ---------------------------------------------------------------- journeys

  Array.prototype.forEach.call(document.querySelectorAll('form[data-journey]'), function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault()

      if (!validate(form)) return

      saveJourney(form.getAttribute('data-journey'), collectAnswers(form))

      var next = form.getAttribute('data-next')
      if (next) window.location.href = next
    })
  })

  // ----------------------------------------------------------- check answers

  Array.prototype.forEach.call(document.querySelectorAll('[data-summary-for]'), function (list) {
    var journey = list.getAttribute('data-summary-for')
    var changeHref = list.getAttribute('data-change-href') || '../'
    var answers = loadJourney(journey)

    if (!answers.length) {
      var empty = list.getAttribute('data-empty-message')
      if (empty) {
        list.innerHTML =
          '<div class="govuk-summary-list__row">' +
          '  <dt class="govuk-summary-list__key">Your answers</dt>' +
          '  <dd class="govuk-summary-list__value">' + empty + '</dd>' +
          '  <dd class="govuk-summary-list__actions"></dd>' +
          '</div>'
      }
      return
    }

    list.innerHTML = answers.map(function (answer) {
      return '<div class="govuk-summary-list__row">' +
        '<dt class="govuk-summary-list__key">' + answer.label + '</dt>' +
        '<dd class="govuk-summary-list__value">' + (answer.value || 'Not provided') + '</dd>' +
        '<dd class="govuk-summary-list__actions">' +
          '<a class="govuk-link" href="' + changeHref + '">Change' +
          '<span class="govuk-visually-hidden"> ' + answer.label + '</span></a>' +
        '</dd>' +
        '</div>'
    }).join('')
  })
})()
