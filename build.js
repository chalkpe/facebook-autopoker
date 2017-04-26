const fs = require('fs')
const mkdirp = require('mkdirp')
const babelify = require('babelify')
const browserify = require('browserify')

async function build () {
  await mkdirp('dist')

  browserify('./app/index.js')
    .external(['webpage', 'system', 'fs'])
    .transform(babelify.configure({ presets: [['env', { loose: true }], 'stage-0'] }))
    .bundle().pipe(fs.createWriteStream('dist/bundle.js'))
}

try {
  build()
} catch (err) {
  console.error(err)
  process.exit(1)
}
