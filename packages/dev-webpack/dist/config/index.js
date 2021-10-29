"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pack = exports.build = exports.dev = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const os_1 = require("os");
const chalk_1 = __importDefault(require("chalk"));
const webpack_1 = __importDefault(require("webpack"));
const gen_1 = __importDefault(require("./gen"));
function getLocalIP() {
    let result = 'localhost';
    const interfaces = os_1.networkInterfaces();
    for (const devName in interfaces) {
        const isEnd = interfaces[devName]?.some((item) => {
            if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal) {
                result = item.address;
                return true;
            }
            return false;
        });
        if (isEnd) {
            break;
        }
    }
    return result;
}
const localIP = getLocalIP();
function dev(projEnvName, port) {
    const config = gen_1.default(process.cwd(), projEnvName, 'development', port);
    const { devServerConfig, clientWebpackConfig, serverWebpackConfig, projectConfig: { cache, sourceMap, projectType, serverPort, nodeEnv, envPath, projEnv, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, useSSR, onCompiled, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
    };
    if (useSSR) {
        envInfo.serverGlobalVar = serverGlobalVar;
    }
    console.info(`projectType: ${chalk_1.default.magenta(projectType)} runMode: ${chalk_1.default.magenta(nodeEnv)} sourceMap: ${chalk_1.default.magenta(sourceMap)}`);
    console.info(`EnvName: ${chalk_1.default.magenta(projEnv)} EnvPath: ${chalk_1.default.magenta(envPath)} EnvInfo: \n${chalk_1.default.gray(JSON.stringify(envInfo, null, 4))} \n`);
    let webpackCompiler;
    if (useSSR) {
        const compiler = webpack_1.default([clientWebpackConfig, serverWebpackConfig]);
        compiler.compilers[0].hooks.failed.tap('elux-webpack-client dev', (msg) => {
            console.error(msg);
            process.exit(1);
        });
        compiler.compilers[1].hooks.failed.tap('elux-webpack-server dev', (msg) => {
            console.error(msg);
            process.exit(1);
        });
        webpackCompiler = compiler;
    }
    else {
        const compiler = webpack_1.default(clientWebpackConfig);
        compiler.hooks.failed.tap('elux-webpack-client dev', (msg) => {
            console.error(msg);
            process.exit(1);
        });
        webpackCompiler = compiler;
    }
    const protocol = devServerConfig.https ? 'https' : 'http';
    const host = devServerConfig.host || '0.0.0.0';
    const publicPath = devServerConfig.dev?.publicPath || '/';
    const localUrl = `${protocol}://localhost:${serverPort}${publicPath}`;
    const localIpUrl = `${protocol}://${localIP}:${serverPort}${publicPath}`;
    const devServer = new webpack_dev_server_1.default(webpackCompiler, devServerConfig);
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, () => {
            devServer.close(() => {
                process.exit(0);
            });
        });
    });
    let isFirstCompile = true;
    webpackCompiler.hooks.done.tap('elux-webpack dev', (stats) => {
        if (stats.hasErrors()) {
            return;
        }
        if (isFirstCompile) {
            isFirstCompile = false;
            console.info(`

***************************************
*                                     *
*           ${chalk_1.default.green.bold('Welcome to Elux')}           *
*                                     *
***************************************
`);
            console.info(`.....${chalk_1.default.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${chalk_1.default.magenta.underline(localUrl)}`);
            console.info(`.....${chalk_1.default.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${chalk_1.default.magenta.underline(localIpUrl)} \n`);
            console.info(`WebpackCache: ${chalk_1.default.blue(cache)}`);
            if (cache !== 'filesystem') {
                console.info(`${chalk_1.default.gray('You can set filesystem cache to speed up compilation: https://webpack.js.org/configuration/cache/')} \n`);
            }
            onCompiled();
        }
    });
    devServer.listen(serverPort, host, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
}
exports.dev = dev;
function build(projEnvName, port) {
    const config = gen_1.default(process.cwd(), projEnvName, 'production', port);
    const { clientWebpackConfig, serverWebpackConfig, projectConfig: { cache, sourceMap, envPath, publicPath, distPath, projectType, nodeEnv, projEnv, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, useSSR, serverPort, apiProxy, onCompiled, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    console.info(`projectType: ${chalk_1.default.magenta(projectType)} runMode: ${chalk_1.default.magenta(nodeEnv)} sourceMap: ${chalk_1.default.magenta(sourceMap)}`);
    console.info(`EnvName: ${chalk_1.default.magenta(projEnv)} EnvPath: ${chalk_1.default.magenta(envPath)} EnvInfo: \n${chalk_1.default.blue(JSON.stringify(envInfo, null, 4))} \n`);
    fs_extra_1.default.ensureDirSync(distPath);
    fs_extra_1.default.emptyDirSync(distPath);
    fs_extra_1.default.copySync(publicPath, distPath, { dereference: true });
    if (fs_extra_1.default.existsSync(envPath)) {
        fs_extra_1.default.copySync(envPath, distPath, { dereference: true, filter: () => true });
    }
    fs_extra_1.default.outputFileSync(path_1.default.join(distPath, 'config.js'), `module.exports = ${JSON.stringify({ projectType, port: serverPort, proxy: apiProxy, clientGlobalVar, serverGlobalVar }, null, 4)}`);
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
        console.info(`WebpackCache: ${chalk_1.default.blue(cache)}`);
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
