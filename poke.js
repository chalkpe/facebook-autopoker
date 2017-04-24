/* eslint-env phantomjs */

var fs = require('fs')
var system = require('system')
var page = require('webpage').create()

if (system.args.length < 3) {
  console.log('usage: poke.js <email> <password>')
  phantom.exit()
}

page.viewportSize = { width: 1920, height: 1080 }
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'

function log () {
  var args = [new Date().toISOString()]
  args.concat.apply(args, arguments)

  return console.log.apply(console, args)
}

function $ (element, tagName) {
  return [].slice.call(element.getElementsByTagName(tagName))
}

function run () {
  var pokedUsers = page.evaluate(function ($) {
    var pattern = /poked you (\d+) times in a row/i

    function isUsername (a) {
      var attr = a.getAttribute('data-hovercard')
      return attr && attr.includes('/ajax/hovercard/user.php?')
    }

    function getUsername (a) {
      var attr = a.getAttribute('data-hovercard')
      return { name: a.innerHTML, id: attr.slice(attr.lastIndexOf('=') + 1) }
    }

    function isTimes (div) {
      return pattern.test(div.innerHTML)
    }

    function getTimes (div) {
      return div && div.innerHTML &&
        parseInt(pattern.exec(div.innerHTML)[1], 10)
    }

    function isPoke (a) {
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

    return $(document, 'a').filter(isPoke).map(poke)
  }, $)

  setTimeout(run, 10)
  if (pokedUsers.length) log('poked:', pokedUsers.join(', '))
}

function takeSnapshot () {
  page.render('facebook.png')
  fs.write('facebook.html', page.content, 'w')

  setTimeout(takeSnapshot, 1000)
}

page.open('https://www.facebook.com/pokes', function (status) {
  var timeout = 30

  takeSnapshot()
  log('status:', status)

  function login ($, system) {
    var emailInput = document.getElementById('email')
    if (emailInput) emailInput.value = system.args[1]

    var passwordInput = document.getElementById('pass')
    if (passwordInput) passwordInput.value = system.args[2]

    var loginButton = document.getElementById('loginbutton')
    if (loginButton) loginButton.click()

    var continueButton = document.getElementById('checkpointSubmitButton')
    if (continueButton) {
      $(document, 'span').forEach(function (span) {
        var text = span.innerHTML.toLowerCase()
        if (text.includes('approve')) span.click()
      })
      continueButton.click()
    }

    return !loginButton && !continueButton && !emailInput &&
      document.title && document.title.indexOf('Log into') < 0 &&
      document.URL && document.URL.indexOf('facebook.com/checkpoint/') < 0
  }

  (function checkLogin () {
    if (--timeout < 0) return log('timeout:', phantom.exit(1))
    if (!page.evaluate(login, $, system)) return setTimeout(checkLogin, 1000)

    log('logged in sucessfully')
    setTimeout(run, 1000)
  }())
})
