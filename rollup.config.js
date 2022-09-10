import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'

const packageJson = require('./package.json')

export default {
  input: './src/index.ts',
  output: [
    { file: packageJson.main, format: 'cjs', sourcemap: true, name: 'easy-parallax', inlineDynamicImports: true },
    { file: packageJson.module, format: 'esm', sourcemap: true, inlineDynamicImports: true }
  ],
  plugins: [
    external(),
    resolve(),
    commonjs(),
    json(),
    typescript(),
    postcss({ modules: true, inject: false, extract: true }),
    terser()
  ]
}
