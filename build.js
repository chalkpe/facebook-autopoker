const fs = require('fs')
const babelify = require('babelify')
const browserify = require('browserify')

browserify('./app/index.js')
  .external(['webpage', 'system', 'fs'])
  .transform(babelify.configure({ presets: [['env', { loose: true }], 'stage-0'] }))
  .bundle().pipe(fs.createWriteStream('dist/bundle.js'))
