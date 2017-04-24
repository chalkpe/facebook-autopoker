/* eslint-env phantomjs */

var url = 'https://www.facebook.com/login.php'
var pokes = 'https://www.facebook.com/pokes/?notif_t=poke'

var system = require('system')
if (system.args.length < 3) {
  console.log('usage: poke.js <email> <password>')
  phantom.exit()
}

var page = require('webpage').create()

// page.onResourceReceived = function (res) { log('<-', res.url) }
// page.onResourceRequested = function (req) { log('->', req.url) }
// page.onConsoleMessage = function (message) { console.log(message) }

page.viewportSize = { width: 1920, height: 1080 }
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'

function log () {
  var args = [].slice.call(arguments)
  console.log.apply(console, [new Date().toISOString()].concat(args))
}

function $ (element, tagName) {
  var list = element.getElementsByTagName(tagName)
  return Array.prototype.slice.call(list)
}

function run () {
  page.render('facebook.png')

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
}

function main (status) {
  log('status:', status)
  page.render('facebook.png')

  login()

  function isLoggedIn ($) {
    function clickApproveOption (span) {
      var message = 'approve your login on another smartphone or computer'
      if (span.innerHTML.toLowerCase().includes(message)) span.click()
    }

    var continueButton = document.getElementById('checkpointSubmitButton')
    if (continueButton) {
      $(document, 'span').map(clickApproveOption)
      continueButton.click()
    }

    return window && window.location && window.location.href &&
      window.location.href.indexOf('facebook.com/checkpoint/') < 0 &&
      document && document.title && document.title.indexOf('Log into') < 0
  }

  function check () {
    if (!page.evaluate(isLoggedIn, $)) return

    clearInterval(loginChecker)
    log('logged in sucessfully')

    if (url !== pokes) {
      page.open((url = pokes), main)
      log('running:', setInterval(run, 50))
    }
  }

  var loginChecker = setInterval(check, 1000)
}

page.open(url, main)
