import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
import webpack, {Compiler, MultiCompiler} from 'webpack';
import {fs, chalk, localIP, log, err} from '@elux/cli-utils';
import genConfig from './gen';

export function dev(projPath: string, projEnvName: string, port?: number): void {
  const config = genConfig(projPath, projEnvName, 'development', port);
  const {
    devServerConfig,
    clientWebpackConfig,
    serverWebpackConfig,
    projectConfig: {
      cache,
      sourceMap,
      projectType,
      serverPort,
      nodeEnv,
      envPath,
      projEnv,
      envConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      useSSR,
      onCompiled,
    },
  } = config;
  const envInfo: any = {
    clientPublicPath,
    clientGlobalVar,
  };
  if (useSSR) {
    envInfo.serverGlobalVar = serverGlobalVar;
  }
  log(`projectType: ${chalk.magenta(projectType)} runMode: ${chalk.magenta(nodeEnv)} sourceMap: ${chalk.magenta(sourceMap)}`);
  log(`EnvName: ${chalk.magenta(projEnv)} EnvPath: ${chalk.magenta(envPath)} EnvInfo: \n${chalk.gray(JSON.stringify(envInfo, null, 4))} \n`);

  let webpackCompiler: MultiCompiler | Compiler;
  if (useSSR) {
    const compiler = webpack([clientWebpackConfig, serverWebpackConfig]);
    compiler.compilers[0].hooks.failed.tap('elux-webpack-client dev', (msg) => {
      err(msg.toString());
      process.exit(1);
    });
    compiler.compilers[1].hooks.failed.tap('elux-webpack-server dev', (msg) => {
      err(msg.toString());
      process.exit(1);
    });
    webpackCompiler = compiler;
  } else {
    const compiler = webpack(clientWebpackConfig);
    compiler.hooks.failed.tap('elux-webpack-client dev', (msg) => {
      err(msg.toString());
      process.exit(1);
    });
    webpackCompiler = compiler;
  }

  const protocol = devServerConfig.https ? 'https' : 'http';
  // const host = devServerConfig.host || '0.0.0.0';
  const publicPath = devServerConfig.dev?.publicPath || '/';
  const localUrl = `${protocol}://localhost:${serverPort}${publicPath}`;
  const localIpUrl = `${protocol}://${localIP}:${serverPort}${publicPath}`;

  const devServer = new WebpackDevServer(devServerConfig, webpackCompiler);

  let isFirstCompile = true;
  webpackCompiler.hooks.done.tap('elux-webpack dev', (stats: any) => {
    if (stats.hasErrors()) {
      return;
    }

    if (isFirstCompile) {
      isFirstCompile = false;
      log(`

***************************************
*                                     *
*           ${chalk.green.bold('Welcome to Elux')}           *
*                                     *
***************************************
`);
      log(`.....${chalk.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${chalk.magenta.underline(localUrl)}`);
      log(`.....${chalk.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${chalk.magenta.underline(localIpUrl)} \n`);
      log(`WebpackCache: ${chalk.blue(cache)}`);
      if (cache !== 'filesystem') {
        log(`${chalk.gray('You can set filesystem cache to speed up compilation: https://webpack.js.org/configuration/cache/')} \n`);
      }
      onCompiled();
    }
  });

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      devServer.stop();
    });
  });

  devServer.start().catch(() => process.exit(1));

  // devServer.startCallback((err: any) => {
  //   if (err) {
  //     err(err);
  //     process.exit(1);
  //   }
  // });
}

export function build(projPath: string, projEnvName: string, port?: number): void {
  const config = genConfig(projPath, projEnvName, 'production', port);
  const {
    clientWebpackConfig,
    serverWebpackConfig,
    projectConfig: {
      cache,
      sourceMap,
      envPath,
      publicPath,
      distPath,
      projectType,
      nodeEnv,
      projEnv,
      envConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      useSSR,
      serverPort,
      apiProxy,
      onCompiled,
    },
  } = config;

  const envInfo = {
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
  };
  log(`projectType: ${chalk.magenta(projectType)} runMode: ${chalk.magenta(nodeEnv)} sourceMap: ${chalk.magenta(sourceMap)}`);
  log(`EnvName: ${chalk.magenta(projEnv)} EnvPath: ${chalk.magenta(envPath)} EnvInfo: \n${chalk.blue(JSON.stringify(envInfo, null, 4))} \n`);

  fs.ensureDirSync(distPath);
  fs.emptyDirSync(distPath);
  fs.copySync(publicPath, distPath, {dereference: true});
  if (fs.existsSync(envPath)) {
    // todo 跳过elux.config.js
    fs.copySync(envPath, distPath, {dereference: true, filter: () => true});
  }
  fs.outputFileSync(
    path.join(distPath, 'config.js'),
    `module.exports = ${JSON.stringify({projectType, port: serverPort, proxy: apiProxy, clientGlobalVar, serverGlobalVar}, null, 4)}`
  );
  const webpackCompiler = useSSR ? webpack([clientWebpackConfig, serverWebpackConfig]) : webpack(clientWebpackConfig);

  webpackCompiler.run((err: any, stats: any) => {
    if (err) throw err;
    process.stdout.write(
      `${stats!.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`
    );
    log(`WebpackCache: ${chalk.blue(cache)}`);
    onCompiled();
  });
}

export function pack(input: string, output: string, target: string): void {
  let outputPath;
  let ouputName;
  if (path.extname(output)) {
    outputPath = path.dirname(output);
    ouputName = path.basename(output);
  } else {
    outputPath = output;
    ouputName = path.basename(input);
  }
  const webpackConfig: any = {
    mode: 'production',
    target,
    stats: 'minimal',
    devtool: false,
    entry: path.resolve(input),
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    output: {
      path: path.resolve(outputPath),
      filename: ouputName,
    },
    plugins: [new webpack.BannerPlugin({banner: 'eslint-disable', entryOnly: true})],
  };
  const compiler = webpack(webpackConfig);

  compiler.run((err, stats) => {
    if (err) throw err;
    process.stdout.write(
      `${stats!.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`
    );
  });
}
