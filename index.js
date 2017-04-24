const prompt = require('prompt')
const phantomjs = require('phantomjs-prebuilt')

const schema = [
  { name: 'email', required: true },
  { name: 'password', required: true, hidden: true },
  { name: 'proxy' }
]

prompt.message = 'facebook-autopoker'
prompt.start()

prompt.get(schema, function (err, result) {
  if (err) return console.error(err)

  let args = ['poke.js', result.email, result.password]
  if (result.proxy.length) args.unshift('--proxy=' + result.proxy)

  const program = phantomjs.exec(...args)

  program.stdout.pipe(process.stdout)
  program.stderr.pipe(process.stderr)

  program.on('exit', code => console.log('exit:', code))
})
