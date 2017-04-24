/* eslint-env phantomjs */
import 'babel-polyfill'

import fs from 'fs'
import system from 'system'
import webpage from 'webpage'

import log from './logger'
import auth from './auth'
import watch from './watch'
import query from './query'

if (system.args.length < 3) {
  console.log('usage: poke.js <email> <password>')
  phantom.exit()
}

const page = webpage.create()

page.facebookTimeout = 30
page.viewportSize = { width: 1920, height: 1080 }
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0'

// page.onConsoleMessage = msg => log(msg)
// page.onResourceReceived = res => log('<-', res.url)
// page.onResourceRequested = req => log('->', req.url)

function takeSnapshot () {
  page.render('facebook.png')
  fs.write('facebook.html', page.content, 'w')

  setTimeout(takeSnapshot, 1000)
}

function login () {
  if (--page.facebookTimeout < 0) return phantom.exit(1)
  if (!page.evaluate(auth, query, system)) return setTimeout(login, 1000)

  log('logged in sucessfully')
  setTimeout(run, 1000)
}

function run () {
  let pokedUsers = page.evaluate(watch, query)
  if (pokedUsers && pokedUsers.length) log('poked:', pokedUsers.join(', '))

  setTimeout(run, 10)
}

page.open('https://www.facebook.com/pokes', status => {
  log('status:', status)

  login()
  takeSnapshot()
})
