const path = require('path')

const src = path.resolve(__dirname, 'src')
const lib = path.resolve(__dirname, 'lib')

const config = {
  entry: path.resolve(src, 'index.js'),

  output: {
    path: lib,
    filename: 'index.js',
    library: 'ReactCreateForm',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, use: 'babel-loader'}
    ]
  },

  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'prop-types': 'prop-types'
  }
}

module.exports = config
