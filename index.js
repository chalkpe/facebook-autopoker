const prompt = require('prompt')
const phantomjs = require('phantomjs-prebuilt')

const schema = {
  properties: {
    email: { required: true },
    password: { required: true, hidden: true }
  }
}

prompt.message = 'facebook-autopoker'
prompt.start()

prompt.get(schema, function (err, { email, password }) {
  if (err) return console.error(err)
  const program = phantomjs.exec('poke.js', email, password)

  program.stdout.pipe(process.stdout)
  program.stderr.pipe(process.stderr)

  program.on('exit', code => console.error('Exit code:', code))
})
