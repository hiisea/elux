/* eslint-disable no-console */
import babel from '@rollup/plugin-babel';
import chalk from 'chalk';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';

const tag = process.env.NODE_TAG || process.env.NODE_ENV;

export default function (root, moduleName, globals, aliasEntries) {
  const cfg = {
    next: {output: [{file: `dist/next/index.js`, format: 'esm'}], mainFields: ['jsnext:main', 'module', 'main']},
    esm: {
      output: [
        {file: `dist/esm/index.js`, format: 'esm'},
        {file: `dist/cjs/index.js`, format: 'cjs'},
        moduleName && {file: `dist/umd/index.js`, format: 'umd', name: moduleName, globals},
        moduleName && {file: `dist/umd/index.min.js`, format: 'umd', name: moduleName, globals, plugins: [terser()], sourcemap: true},
      ].filter(Boolean),
      mainFields: ['module', 'main'],
    },
  };
  const env = cfg[tag];
  const extensions = ['.js', '.ts', '.tsx'];
  const pkgResult = {include: {}, external: {}};
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(path.resolve(root, './package.json'));

  const externals = Object.keys(pkg.externals ? pkg.externals : {...pkg.dependencies, ...pkg.peerDependencies});
  const config = {
    input: 'src/',
    output: env.output,
    external: (id) => {
      const hit = externals.some((mod) => mod === id || id.startsWith(`${mod}/`));
      if (hit) {
        if (!pkgResult.external[id]) {
          pkgResult.external[id] = true;
          console.warn(chalk.red('external: '), id);
        }
      } else if (!pkgResult.include[id]) {
        pkgResult.include[id] = true;
        console.warn(chalk.green('include: '), id);
      }
      return hit;
    },
    plugins: [
      aliasEntries &&
        alias({
          entries: aliasEntries,
        }),
      process.env.NODE_ENV === 'production' && replace({'process.env.NODE_ENV': '"production"'}),
      resolve({extensions, mainFields: env.mainFields}),
      babel({
        exclude: 'node_modules/**',
        extensions,
        babelHelpers: 'runtime',
        skipPreflightCheck: true,
        // externalHelpers: true,
      }),
      commonjs(),
    ].filter(Boolean),
  };
  return config;
}
