#!/usr/bin/env node

const {program} = require('commander');
const {dev, build, pack} = require('../dist/config');

program
  .command('dev [env]')
  .description('Use a preset env configurations to start the dev server. default env is "local"')
  .option('--no-debug', 'output extra debugging')
  .option('--debug', 'output extra debugging')
  .option('--port', 'Normalize a port into a number')
  .action((env, options) => {
    dev(env || 'local', !!options.debug, !!options.port);
  });

program
  .command('build [env]')
  .description('Use a preset env configurations to build the project. default env is "local"')
  .option('--debug', 'output extra debugging')
  .action((env, options) => {
    build(env || 'local', !!options.debug);
  });

program
  .command('pack <input> <output>')
  .description('Use webpack to package a js file')
  .option('--target <type>', "webpackConfig's target", 'es5')
  .action((input, output, options) => {
    pack(input, output, options.target || 'es5');
  });

program.parse(process.argv);
