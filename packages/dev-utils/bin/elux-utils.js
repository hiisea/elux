#!/usr/bin/env node

const {program} = require('commander');
const path = require('path');
const {spawn} = require('child_process');
const patchActions = require('../dist/patch-actions');
const genMockConfig = require('../dist/mock-config');

program
  .command('patch-actions [entry] [tsconfig]')
  .description('Patch the actions without proxy')
  .option('--echo', 'echo only, do not write')
  .action((tsconfig, entry, options) => {
    patchActions(tsconfig, entry, !!options.echo);
  });

program
  .command('mock-start [env]')
  .description('Start a mock server')
  .option('--watch', 'Watch for file changes')
  .option('--dir', 'Specify the mock dir path')
  .option('--port', 'Normalize a port into a number')
  .action((env, options) => {
    const {port, dir} = genMockConfig(process.cwd(), env || 'local', options.port, options.dir);
    const src = path.join(dir, './src');
    const tsconfig = path.join(dir, './tsconfig.json');
    const start = path.join(__dirname, '../dist/mock-start.js');
    let cmd = '';
    if (options.watch) {
      cmd = `nodemon -e ts,js,json -w ${src} --exec ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
    } else {
      cmd = `ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
    }
    process.env.SRC = src;
    process.env.PORT = port;
    spawn(cmd, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  });

program.parse(process.argv);
