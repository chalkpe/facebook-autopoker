/* eslint-env phantomjs */

var url = 'https://www.facebook.com/pokes'

var fs = require('fs')
var system = require('system')

if (system.args.length < 3) {
  console.log('usage: poke.js <email> <password>')
  phantom.exit()
}

var page = require('webpage').create()

// page.onResourceReceived = function (res) { log('<-', res.url) }
page.onResourceRequested = function (req) { log('->', req.url) }
page.onConsoleMessage = function (message) { console.log(message) }

page.viewportSize = { width: 1920, height: 1080 }
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'

function log () {
  var args = [].slice.call(arguments)
  console.log.apply(console, [new Date().toISOString()].concat(args))
}

function save () {
  page.render('facebook.png')
  fs.write('facebook.html', page.content, 'w')
}

function $ (element, tagName) {
  var list = element.getElementsByTagName(tagName)
  return Array.prototype.slice.call(list)
}

function run () {
  save()

  var pokedUsers = page.evaluate(function ($) {
    function isUsername (a) {
      var attr = a.getAttribute('data-hovercard')
      return attr && attr.includes('/ajax/hovercard/user.php?')
    }

    function getUsername (a) {
      var attr = a.getAttribute('data-hovercard')
      return { name: a.innerHTML, id: attr.slice(attr.lastIndexOf('=') + 1) }
    }

    var pattern = /poked you (\d+) times in a row/i

    function isTimes (div) {
      return pattern.test(div.innerHTML)
    }

    function getTimes (div) {
      return div && div.innerHTML &&
        parseInt(pattern.exec(div.innerHTML)[1], 10)
    }

    function isPokeBackButton (a) {
      return a.getAttribute('data-already-poked') !== 'yes' &&
        a.innerHTML.toLowerCase().includes('poke back')
    }

    function poke (a) {
      a.click()
      a.setAttribute('data-already-poked', 'yes')

      var block = a.parentElement.parentElement.parentElement
      var user = getUsername($(block, 'a').filter(isUsername).pop())
      var times = getTimes($(block, 'div').filter(isTimes).pop())

      times = times ? 'x' + times : ''
      return user.name + ' ' + times + ' (' + user.id + ')'
    }

    return $(document, 'a').filter(isPokeBackButton).map(poke)
  }, $)

  if (!pokedUsers.length) return
  log('poked:', pokedUsers.join(', '))
}

function login () {
  var email = system.args[1]
  var password = system.args[2]

  log('login:', page.evaluate(function (email, password) {
    var emailInput = document.getElementById('email')
    var passwordInput = document.getElementById('pass')
    var loginButton = document.getElementById('loginbutton')

    if (emailInput) emailInput.value = email
    if (passwordInput) passwordInput.value = password
    if (loginButton) loginButton.click()

    return email
  }, email, password))

  save()
}

function isLoggedIn ($) {
  function clickApproveOption (span) {
    var message = 'approve your login on another'
    if (span.innerHTML.toLowerCase().includes(message)) span.click()
  }

  var continueButton = document.getElementById('checkpointSubmitButton')
  if (continueButton) {
    $(document, 'span').map(clickApproveOption)
    continueButton.click()
  }

  var list = [].slice.call(document.querySelectorAll('.uiHeaderTitle a[href]'))

  return continueButton === null &&
    window && window.location && window.location.href &&
    window.location.href.indexOf('facebook.com/checkpoint/') < 0 &&
    document && document.title && document.title.indexOf('Log into') < 0 &&
    list.some(function (a) { return a.innerHTML.includes('Pokes') })
}

function main (status) {
  log('status:', status)

  save()
  login()

  var timeout = 30

  var loginChecker = setInterval(function () {
    save()

    if (--timeout < 0) {
      clearInterval(loginChecker)
      return page.open(url, main)
    }

    if (page.evaluate(isLoggedIn, $)) {
      clearInterval(loginChecker)

      log('logged in sucessfully')
      log('running', setInterval(run, 50))
    }
  }, 1000)
}

page.open(url, main)
