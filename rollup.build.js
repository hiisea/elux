/* eslint-disable no-console */
import babel from '@rollup/plugin-babel';
import chalk from 'chalk';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import * as fs from 'fs';

const tag = process.env.NODE_TAG || process.env.NODE_ENV;

function createConfig(inputFile, externals, aliasEntries) {
  const outputFile = inputFile.replace('src/', '');
  const cfg = {
    next: {output: [{file: `dist/next/${outputFile}index.js`, format: 'esm'}], mainFields: ['jsnext:main', 'module', 'main']},
    esm: {
      output: [
        {file: `dist/esm/${outputFile}index.js`, format: 'esm'},
        {file: `dist/cjs/${outputFile}index.js`, format: 'cjs'},
      ].filter(Boolean),
      mainFields: ['module', 'main'],
    },
  };
  const env = cfg[tag];
  const extensions = ['.js', '.ts', '.tsx'];
  const pkgResult = {include: {}, external: {}};

  const config = {
    input: inputFile,
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

export default function (root, aliasEntries) {
  const inputFiles = ['src/'];
  const libsDir = path.resolve(root, './src/lib/');
  if (fs.existsSync(libsDir)) {
    const libs = fs.readdirSync(libsDir);
    libs.forEach((item) => {
      inputFiles.push(`src/lib/${item}/`);
    });
  }
  console.log(inputFiles);
  const pkg = require(path.resolve(root, './package.json'));
  const externals = Object.keys(pkg.externals ? pkg.externals : {...pkg.dependencies, ...pkg.peerDependencies});
  return inputFiles.map((bundle) => createConfig(bundle, externals, aliasEntries));
}
