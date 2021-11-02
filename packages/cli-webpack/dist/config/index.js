"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pack = exports.build = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const webpack_1 = __importDefault(require("webpack"));
const cli_utils_1 = require("@elux/cli-utils");
const gen_1 = __importDefault(require("./gen"));
function dev(projPath, projEnvName, port) {
    const config = gen_1.default(projPath, projEnvName, 'development', port);
    const { devServerConfig, clientWebpackConfig, serverWebpackConfig, projectConfig: { cache, sourceMap, projectType, serverPort, nodeEnv, envPath, projEnv, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, useSSR, onCompiled, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
    };
    if (useSSR) {
        envInfo.serverGlobalVar = serverGlobalVar;
    }
    cli_utils_1.log(`projectType: ${cli_utils_1.chalk.magenta(projectType)} runMode: ${cli_utils_1.chalk.magenta(nodeEnv)} sourceMap: ${cli_utils_1.chalk.magenta(sourceMap)}`);
    cli_utils_1.log(`EnvName: ${cli_utils_1.chalk.magenta(projEnv)} EnvPath: ${cli_utils_1.chalk.magenta(envPath)} EnvInfo: \n${cli_utils_1.chalk.gray(JSON.stringify(envInfo, null, 4))} \n`);
    let webpackCompiler;
    if (useSSR) {
        const compiler = webpack_1.default([clientWebpackConfig, serverWebpackConfig]);
        compiler.compilers[0].hooks.failed.tap('elux-webpack-client dev', (msg) => {
            cli_utils_1.err(msg.toString());
            process.exit(1);
        });
        compiler.compilers[1].hooks.failed.tap('elux-webpack-server dev', (msg) => {
            cli_utils_1.err(msg.toString());
            process.exit(1);
        });
        webpackCompiler = compiler;
    }
    else {
        const compiler = webpack_1.default(clientWebpackConfig);
        compiler.hooks.failed.tap('elux-webpack-client dev', (msg) => {
            cli_utils_1.err(msg.toString());
            process.exit(1);
        });
        webpackCompiler = compiler;
    }
    const protocol = devServerConfig.https ? 'https' : 'http';
    const publicPath = devServerConfig.dev?.publicPath || '/';
    const localUrl = `${protocol}://localhost:${serverPort}${publicPath}`;
    const localIpUrl = `${protocol}://${cli_utils_1.localIP}:${serverPort}${publicPath}`;
    const devServer = new webpack_dev_server_1.default(devServerConfig, webpackCompiler);
    let isFirstCompile = true;
    webpackCompiler.hooks.done.tap('elux-webpack dev', (stats) => {
        if (stats.hasErrors()) {
            return;
        }
        if (isFirstCompile) {
            isFirstCompile = false;
            cli_utils_1.log(`

***************************************
*                                     *
*           ${cli_utils_1.chalk.green.bold('Welcome to Elux')}           *
*                                     *
***************************************
`);
            cli_utils_1.log(`.....${cli_utils_1.chalk.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${cli_utils_1.chalk.magenta.underline(localUrl)}`);
            cli_utils_1.log(`.....${cli_utils_1.chalk.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${cli_utils_1.chalk.magenta.underline(localIpUrl)} \n`);
            cli_utils_1.log(`WebpackCache: ${cli_utils_1.chalk.blue(cache)}`);
            if (cache !== 'filesystem') {
                cli_utils_1.log(`${cli_utils_1.chalk.gray('You can set filesystem cache to speed up compilation: https://webpack.js.org/configuration/cache/')} \n`);
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
}
exports.dev = dev;
function build(projPath, projEnvName, port) {
    const config = gen_1.default(projPath, projEnvName, 'production', port);
    const { clientWebpackConfig, serverWebpackConfig, projectConfig: { cache, sourceMap, envPath, publicPath, distPath, projectType, nodeEnv, projEnv, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, useSSR, serverPort, apiProxy, onCompiled, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    cli_utils_1.log(`projectType: ${cli_utils_1.chalk.magenta(projectType)} runMode: ${cli_utils_1.chalk.magenta(nodeEnv)} sourceMap: ${cli_utils_1.chalk.magenta(sourceMap)}`);
    cli_utils_1.log(`EnvName: ${cli_utils_1.chalk.magenta(projEnv)} EnvPath: ${cli_utils_1.chalk.magenta(envPath)} EnvInfo: \n${cli_utils_1.chalk.blue(JSON.stringify(envInfo, null, 4))} \n`);
    cli_utils_1.fs.ensureDirSync(distPath);
    cli_utils_1.fs.emptyDirSync(distPath);
    cli_utils_1.fs.copySync(publicPath, distPath, { dereference: true });
    if (cli_utils_1.fs.existsSync(envPath)) {
        cli_utils_1.fs.copySync(envPath, distPath, { dereference: true, filter: () => true });
    }
    cli_utils_1.fs.outputFileSync(path_1.default.join(distPath, 'config.js'), `module.exports = ${JSON.stringify({ projectType, port: serverPort, proxy: apiProxy, clientGlobalVar, serverGlobalVar }, null, 4)}`);
    const webpackCompiler = useSSR ? webpack_1.default([clientWebpackConfig, serverWebpackConfig]) : webpack_1.default(clientWebpackConfig);
    webpackCompiler.run((err, stats) => {
        if (err)
            throw err;
        process.stdout.write(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        })}\n\n`);
        cli_utils_1.log(`WebpackCache: ${cli_utils_1.chalk.blue(cache)}`);
        onCompiled();
    });
}
exports.build = build;
function pack(input, output, target) {
    let outputPath;
    let ouputName;
    if (path_1.default.extname(output)) {
        outputPath = path_1.default.dirname(output);
        ouputName = path_1.default.basename(output);
    }
    else {
        outputPath = output;
        ouputName = path_1.default.basename(input);
    }
    const webpackConfig = {
        mode: 'production',
        target,
        stats: 'minimal',
        devtool: false,
        entry: path_1.default.resolve(input),
        optimization: {
            minimizer: [
                new terser_webpack_plugin_1.default({
                    extractComments: false,
                }),
            ],
        },
        output: {
            path: path_1.default.resolve(outputPath),
            filename: ouputName,
        },
        plugins: [new webpack_1.default.BannerPlugin({ banner: 'eslint-disable', entryOnly: true })],
    };
    const compiler = webpack_1.default(webpackConfig);
    compiler.run((err, stats) => {
        if (err)
            throw err;
        process.stdout.write(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        })}\n\n`);
    });
}
exports.pack = pack;
