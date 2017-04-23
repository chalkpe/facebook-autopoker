/* eslint-env phantomjs */

var system = require('system')
if (system.args.length < 3) {
  console.log('usage: poke.js <email> <password>')
  phantom.exit()
}

var page = require('webpage').create()
// page.onResourceReceived = function (res) { log('<-', res.url) }
// page.onResourceRequested = function (req) { log('->', req.url) }
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'

function log () {
  var args = [new Date().toISOString()].concat([].slice.call(arguments))
  console.log.apply(console, args)
}

function run () {
  var pokedUsers = page.evaluate(function () {
    function $ (element, tagName) {
      var list = element.getElementsByTagName(tagName)
      return Array.prototype.slice.call(list)
    }

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
      return parseInt(pattern.exec(div.innerHTML)[1], 10)
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

      return user.name + ' x' + times + ' (' + user.id + ')'
    }

    return $(document, 'a').filter(isPokeBackButton).map(poke)
  })

  if (!pokedUsers.length) return
  log('poked:', pokedUsers.join(', '))
}

page.open('https://www.facebook.com/pokes', function (status) {
  log('status:', status)
  if (status !== 'success') return phantom.exit(1)

  var email = system.args[1]
  var password = system.args[2]
  var timeout = 100 // 10 seconds

  log('login:', page.evaluate(function (email, password) {
    document.getElementById('email').value = email
    document.getElementById('pass').value = password
    document.getElementById('loginbutton').click()

    return email
  }, email, password))

  function isLoggedIn () {
    return document.title.toLowerCase().indexOf('log into facebook') < 0
  }

  function check () {
    if (--timeout <= 0) return phantom.exit(2)
    if (!page.evaluate(isLoggedIn)) return

    clearInterval(loginChecker)
    setInterval(run, 50)

    log('run: logged in sucessfully')
  }

  var loginChecker = setInterval(check, 100)
})
