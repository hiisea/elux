"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const cli_utils_1 = require("@elux/cli-utils");
const schema_utils_1 = require("schema-utils");
const utils_1 = __importDefault(require("./utils"));
const EluxConfigSchema = {
    type: 'object',
    additionalProperties: false,
    definitions: {
        CssLoader: { type: 'object', properties: { loader: { type: 'string' } } },
        EnvConfig: {
            type: 'object',
            additionalProperties: false,
            properties: {
                clientPublicPath: { type: 'string' },
                clientGlobalVar: { type: 'object' },
                serverGlobalVar: { type: 'object' },
                onCompiled: { instanceof: 'Function' },
                sourceMap: { type: 'string' },
                cache: {
                    anyOf: [
                        {
                            type: 'boolean',
                        },
                        {
                            type: 'object',
                        },
                    ],
                },
                eslint: { type: 'boolean' },
                stylelint: { type: 'boolean' },
                resolveAlias: {
                    type: 'object',
                },
                urlLoaderLimitSize: {
                    type: 'number',
                    description: 'Default is 8192',
                },
                apiProxy: { type: 'object' },
                serverPort: {
                    type: 'number',
                    description: 'Default is 4003',
                },
                webpackConfigTransform: {
                    instanceof: 'Function',
                    description: 'Provides an custom function to transform webpackConfig: (webpackConfig) => webpackConfig',
                },
            },
        },
    },
    properties: {
        type: {
            enum: ['vue', 'vue ssr', 'react', 'react ssr'],
        },
        dir: {
            type: 'object',
            additionalProperties: false,
            properties: {
                srcPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./src',
                },
                distPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./dist',
                },
                publicPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./public',
                },
                mockPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./mock',
                },
                envPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./env',
                },
            },
        },
        cssModulesOptions: {
            type: 'object',
        },
        cssProcessors: {
            type: 'object',
            additionalProperties: false,
            properties: {
                less: {
                    anyOf: [
                        {
                            type: 'boolean',
                        },
                        {
                            $ref: '#/definitions/CssLoader',
                        },
                    ],
                },
                sass: {
                    anyOf: [
                        {
                            type: 'boolean',
                        },
                        {
                            $ref: '#/definitions/CssLoader',
                        },
                    ],
                },
                scss: {
                    anyOf: [
                        {
                            type: 'boolean',
                        },
                        {
                            $ref: '#/definitions/CssLoader',
                        },
                    ],
                },
            },
        },
        moduleFederation: {
            type: 'object',
        },
        devServerConfigTransform: {
            instanceof: 'Function',
            description: 'Provides an custom function to transform webpack devServerConfig: (devServerConfig) => devServerConfig',
        },
        mockServer: {
            type: 'object',
            additionalProperties: false,
            properties: {
                port: {
                    type: 'number',
                    description: 'Default is 3003',
                },
            },
        },
        all: {
            $ref: '#/definitions/EnvConfig',
        },
        dev: {
            $ref: '#/definitions/EnvConfig',
        },
        prod: {
            $ref: '#/definitions/EnvConfig',
        },
    },
};
function moduleExports(rootPath, projEnv, nodeEnv, _serverPort) {
    const baseEluxConfig = cli_utils_1.fs.existsSync(path_1.default.join(rootPath, 'elux.config.js'))
        ? require(path_1.default.join(rootPath, 'elux.config.js'))
        : {};
    schema_utils_1.validate(EluxConfigSchema, baseEluxConfig, { name: '@elux/EluxConfig' });
    const envPath = baseEluxConfig.dir?.envPath || './env';
    const projEnvPath = path_1.default.resolve(rootPath, envPath, `./${projEnv}`);
    cli_utils_1.fs.ensureDirSync(projEnvPath);
    const envEluxConfig = cli_utils_1.fs.existsSync(path_1.default.join(projEnvPath, `elux.config.js`))
        ? require(path_1.default.join(projEnvPath, `elux.config.js`))
        : {};
    schema_utils_1.validate(EluxConfigSchema, envEluxConfig, { name: '@elux/EluxConfig' });
    const defaultBaseConfig = {
        type: 'react',
        dir: {
            srcPath: './src',
            distPath: './dist',
            publicPath: './public',
            mockPath: './mock',
            envPath: './env',
        },
        cssProcessors: { less: false, scss: false, sass: false },
        cssModulesOptions: {},
        moduleFederation: {},
        devServerConfigTransform: (config) => config,
        all: {
            serverPort: 4003,
            eslint: true,
            stylelint: true,
            cache: true,
            resolveAlias: {},
            urlLoaderLimitSize: 8192,
            clientPublicPath: '/client/',
            clientGlobalVar: {},
            serverGlobalVar: {},
            sourceMap: 'eval-cheap-module-source-map',
            webpackConfigTransform: (config) => config,
            onCompiled: () => undefined,
            apiProxy: {},
        },
        prod: {
            sourceMap: 'hidden-cheap-module-source-map',
        },
        mockServer: { port: 3003 },
    };
    const eluxConfig = cli_utils_1.deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);
    const envConfig = cli_utils_1.deepExtend(eluxConfig.all, eluxConfig[nodeEnv === 'development' ? 'dev' : 'prod']);
    const { dir: { srcPath, publicPath }, type, moduleFederation, devServerConfigTransform, cssProcessors, cssModulesOptions, } = eluxConfig;
    const { serverPort, cache, eslint, stylelint, urlLoaderLimitSize, resolveAlias, clientPublicPath, clientGlobalVar, serverGlobalVar, sourceMap, onCompiled, webpackConfigTransform, apiProxy, } = envConfig;
    const useSSR = type === 'react ssr' || type === 'vue ssr';
    const UIType = type.split(' ')[0];
    const distPath = path_1.default.resolve(rootPath, eluxConfig.dir.distPath, projEnv);
    let { devServerConfig, clientWebpackConfig, serverWebpackConfig } = utils_1.default({
        cache,
        sourceMap,
        nodeEnv,
        rootPath,
        srcPath: path_1.default.resolve(rootPath, srcPath),
        distPath: path_1.default.resolve(rootPath, distPath),
        publicPath: path_1.default.resolve(rootPath, publicPath),
        clientPublicPath,
        envPath: projEnvPath,
        cssProcessors,
        cssModulesOptions,
        enableEslintPlugin: eslint,
        enableStylelintPlugin: stylelint,
        UIType,
        limitSize: urlLoaderLimitSize,
        globalVar: { client: clientGlobalVar, server: serverGlobalVar },
        apiProxy,
        useSSR,
        serverPort: _serverPort || serverPort,
        resolveAlias,
        moduleFederation: Object.keys(moduleFederation).length > 0 ? moduleFederation : undefined,
    });
    devServerConfig = devServerConfigTransform(devServerConfig);
    clientWebpackConfig = webpackConfigTransform(clientWebpackConfig);
    if (useSSR) {
        serverWebpackConfig = webpackConfigTransform(serverWebpackConfig);
    }
    return {
        devServerConfig,
        clientWebpackConfig,
        serverWebpackConfig,
        projectConfig: {
            rootPath,
            projEnv,
            nodeEnv,
            srcPath: path_1.default.resolve(rootPath, srcPath),
            distPath: path_1.default.resolve(rootPath, distPath),
            publicPath: path_1.default.resolve(rootPath, publicPath),
            envPath: projEnvPath,
            sourceMap,
            cache: cache === true ? 'memory' : cache === false ? '' : cache.type,
            projectType: type,
            envConfig,
            useSSR,
            serverPort: _serverPort || serverPort,
            apiProxy,
            onCompiled,
        },
    };
}
module.exports = moduleExports;
