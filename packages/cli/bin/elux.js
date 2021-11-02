#!/usr/bin/env node

const {chalk, semver, minimist, log} = require('@elux/cli-utils');
const leven = require('leven');
const requiredVersion = require('../package.json').engines.node;

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted, {includePrerelease: true})) {
    log(
      chalk.red(
        'You are using Node ' + process.version + ', but this version of ' + id + ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
      )
    );
    process.exit(1);
  }
}

checkNodeVersion(requiredVersion, '@elux/cli');

const program = require('commander');
program.version(`@elux/cli ${require('../package').version}`).usage('<command> [options]');

program
  .command('dev [env]')
  .description('Use a preset env configurations to start the devServer. Default is local')
  .option('-c, --compiler <value>', 'Default is webpack')
  .option('-p, --port <value>', 'Normalize a port into a number. Default is to load from elux.config.js')
  .action((env, options) => {
    const moduleName = `@elux/cli-${options.compiler || 'webpack'}`;
    const args = [process.cwd(), env || 'local', options.port];
    require(moduleName).dev(...args);
  });

program
  .command('build [env]')
  .description('Use a preset env configurations to build the project. Default is local')
  .option('-c, --compiler <value>', 'Default is webpack')
  .option('-p, --port <value>', 'Normalize a port into a number. Default is to load from elux.config.js')
  .action((env, options) => {
    const moduleName = `@elux/cli-${options.compiler || 'webpack'}`;
    const args = [process.cwd(), env || 'local', options.port];
    require(moduleName).build(...args);
  });

program
  .command('mock [env]')
  .description('Use a preset env configurations to start the mockServer')
  .option('-w, --watch', 'Watching for file changes')
  .option('-d, --dir <value>', 'Specify the mock dir path. Default is to load from elux.config.js')
  .option('-p, --port <value>', 'Normalize a port into a number. Default is to load from elux.config.js')
  .action((env, options) => {
    const args = [process.cwd(), env || 'local', options];
    require('@elux/cli-mock')(...args);
  });

program
  .command('pack <input> <output>')
  .description('Packaging JS files using a packer')
  .option('-c, --compiler <value>', 'Default is webpack')
  .option('-t, --target <type>', 'Refer to the target of webpack. Default is es5')
  .action((input, output, options) => {
    const moduleName = `@elux/cli-${options.compiler || 'webpack'}`;
    const args = [input, output, options.target || 'es5'];
    require(moduleName).pack(...args);
  });

program
  .command('demote [entry] [tsconfig]')
  .description('Patch the actions without proxy, Make it compatible with lower version browsers')
  .option('--echo', 'echo only, do not write')
  .action((tsconfig, entry, options) => {
    const args = [tsconfig, entry, !!options.echo];
    require('../dist/patch-actions')(...args);
  });

program
  .command('create <app-name>')
  .description('create a new project')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .option('-d, --default', 'Skip prompts and use default preset')
  .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--merge', 'Merge target directory if it exists')
  .option('-c, --clone', 'Use git clone when fetching remote preset')
  .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  .option('-b, --bare', 'Scaffold project without beginner instructions')
  .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      log(chalk.yellow("\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."));
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true;
    }
    require('../lib/create')(name, options);
  });

// output help information on unknown commands
program.on('command:*', ([cmd]) => {
  program.outputHelp();
  log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  log();
  suggestCommands(cmd);
  process.exitCode = 1;
});

// add some useful info on help
program.on('--help', () => {
  log();
  log(`  Run ${chalk.cyan(`elux <command> --help`)} for detailed usage of given command.`);
  log();
});

program.commands.forEach((c) => c.on('--help', () => log()));

program.parse(process.argv);

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name);

  let suggestion;

  availableCommands.forEach((cmd) => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
}
