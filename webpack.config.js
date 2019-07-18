const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env, argv) => {
  const dev = argv.mode !== 'production'
  return {
    target: 'web',
    devtool: dev ? 'inline-source-map' : false,
    devServer: { contentBase: './dist/' },
    entry: { 'easy-parallax': './src/index.js' },
    output: {
      path: path.resolve(__dirname, './dist'),
      library: 'easyParallax',
      libraryExport: 'default',
      libraryTarget: 'umd',
      filename: '[name].js'
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: {
          babelrc: false,
          presets: ['@babel/env'],
          plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-syntax-dynamic-import']
        } } },
        { test: /\.js$/, use: { loader: 'babel-loader' }, exclude: /(node_modules\/(?!(dom7|swiper)\/).*)/ },
        { test: /\.css$/, use: ['css-to-string-loader', 'css-loader'] },
        { test: /\.scss$/, use: ['css-to-string-loader', 'css-loader', 'sass-loader'] },
        { test: /\.svg$/, loader: 'svg-url-loader', options: { encoding: 'base64' } },
        { test: /\.riot$/, exclude: /node_modules/, use: [{ loader: './webpack/riot-loader', options: { hot: true } }] }
      ]
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({ exclude: /node_modules/ })
      ]
    }
  }
}
