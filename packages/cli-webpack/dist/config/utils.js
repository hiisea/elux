"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const cli_utils_1 = require("@elux/cli-utils");
const ssr_inject_1 = __importDefault(require("../plugin/ssr-inject"));
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const ModuleFederationPlugin = require('../../libs/ModuleFederationPlugin');
const ContainerReferencePlugin = require('../../libs/ContainerReferencePlugin');
function getCssScopedName(srcPath, localName, mfileName) {
    if (mfileName.match(/[/\\]global.module.\w+?$/)) {
        return `g-${localName}`;
    }
    mfileName = mfileName
        .replace(/^.*[/\\]node_modules[/\\]/, 'modules/')
        .replace(/^@.+?[/\\]/, '')
        .replace(srcPath, '')
        .replace(/\W/g, '-')
        .replace(/^-|-index-module-\w+$|-module-\w+$|-index-vue$|-vue$/g, '')
        .replace(/^components-/, 'comp-')
        .replace(/^modules-.*?(\w+)-views(-?)(.*)/, '$1$2$3')
        .replace(/^modules-.*?(\w+)-components(-?)(.*)/, '$1-comp$2$3');
    return localName === 'root' ? mfileName : `${mfileName}_${localName}`;
}
function getUrlLoader(isProdModel, type, disable, limitSize) {
    const fileLoader = {
        loader: 'file-loader',
        options: {
            name: `${type}/[name]${isProdModel ? '.[hash:8]' : ''}.[ext]`,
        },
    };
    if (disable) {
        return fileLoader;
    }
    return {
        loader: 'url-loader',
        options: {
            limit: limitSize,
            fallback: fileLoader,
        },
    };
}
function oneOfCssLoader(isProdModel, srcPath, isVue, isServer, cssModulesOptions, extensionLoader) {
    let cssProcessors = null;
    if (extensionLoader === 'less') {
        cssProcessors = {
            loader: 'less-loader',
        };
    }
    else if (extensionLoader === 'sass') {
        cssProcessors = {
            loader: 'sass-loader',
        };
    }
    else if (extensionLoader === 'scss') {
        cssProcessors = {
            loader: 'scss-loader',
        };
    }
    else if (extensionLoader) {
        cssProcessors = extensionLoader;
    }
    const styleLoader = isProdModel
        ? { loader: MiniCssExtractPlugin.loader }
        : isVue
            ? {
                loader: 'vue-style-loader',
                options: {
                    sourceMap: false,
                    shadowMode: false,
                },
            }
            : {
                loader: 'style-loader',
            };
    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: false,
            importLoaders: 2,
        },
    };
    const cssLoaderWithModule = {
        loader: 'css-loader',
        options: {
            sourceMap: false,
            importLoaders: 2,
            modules: {
                getLocalIdent: (context, localIdentName, localName) => {
                    return getCssScopedName(srcPath, localName, context.resourcePath);
                },
                localIdentContext: srcPath,
                ...cssModulesOptions,
                exportOnlyLocals: isServer,
            },
        },
    };
    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: false,
        },
    };
    const withModule = (isServer ? [cssLoaderWithModule, cssProcessors] : [styleLoader, cssLoaderWithModule, postcssLoader, cssProcessors]).filter(Boolean);
    const withoutModule = (isServer ? ['null-loader'] : [styleLoader, cssLoader, postcssLoader, cssProcessors].filter(Boolean));
    return isVue
        ? [
            {
                resourceQuery: /module/,
                use: withModule,
            },
            {
                resourceQuery: /\?vue/,
                use: withoutModule,
            },
            {
                test: /\.module\.\w+$/,
                use: withModule,
            },
            { use: withoutModule },
        ]
        : [
            {
                test: /\.module\.\w+$/,
                use: withModule,
            },
            { use: withoutModule },
        ];
}
function oneOfTsLoader(isProdModel, isVue, isServer) {
    const loaders = [
        {
            loader: 'babel-loader',
        },
    ];
    if (isVue) {
        loaders.push({
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
                appendTsSuffixTo: ['\\.vue$'],
                happyPackMode: false,
            },
        });
    }
    else if (!isVue && !isServer && !isProdModel) {
        loaders[0].options = {
            plugins: [require.resolve('react-refresh/babel')],
        };
    }
    if (isServer) {
        return [
            {
                test: /[/\\]index\.ts$/,
                use: [...loaders, { loader: '@elux/cli-webpack/dist/loader/server-module-loader' }],
            },
            { use: loaders },
        ];
    }
    return [
        {
            test: /[/\\]index\.ts$/,
            use: [...loaders, { loader: '@elux/cli-webpack/dist/loader/client-module-loader' }],
        },
        { use: loaders },
    ];
}
function tsxLoaders(isProdModel, isVue, isServer) {
    const loaders = [
        {
            loader: 'babel-loader',
        },
    ];
    if (isVue) {
        loaders.push({
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
                appendTsxSuffixTo: ['\\.vue$'],
                happyPackMode: false,
            },
        });
    }
    else if (!isVue && !isServer && !isProdModel) {
        loaders[0].options = {
            plugins: [require.resolve('react-refresh/babel')],
        };
    }
    return loaders;
}
function moduleExports({ cache, sourceMap, nodeEnv, rootPath, srcPath, distPath, publicPath, clientPublicPath, envPath, cssProcessors, cssModulesOptions, enableEslintPlugin, enableStylelintPlugin, UIType, limitSize, globalVar, apiProxy, useSSR, serverPort, resolveAlias, moduleFederation, }) {
    const isProdModel = nodeEnv === 'production';
    if (!isProdModel) {
        clientPublicPath = `${clientPublicPath.replace('//', '``').replace(/\/.+$/, '').replace('``', '//')}/client/`;
    }
    if (moduleFederation && !/^(http:|https:|)\/\//.test(clientPublicPath)) {
        clientPublicPath = `http://localhost:${serverPort}${clientPublicPath}`;
    }
    if (moduleFederation) {
        ContainerReferencePlugin.__setModuleMap__(moduleFederation.modules || {});
        delete moduleFederation.modules;
    }
    const isVue = UIType === 'vue';
    const tsconfigPathTest = [path_1.default.join(srcPath, 'tsconfig.json'), path_1.default.join(rootPath, 'tsconfig.json')];
    const tsconfigPath = fs_1.default.existsSync(tsconfigPathTest[0]) ? tsconfigPathTest[0] : tsconfigPathTest[1];
    const tsconfig = require(tsconfigPath);
    const { paths = {}, baseUrl = '' } = tsconfig.compilerOptions || {};
    const scriptExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    const cssExtensions = ['css'];
    if (isVue) {
        scriptExtensions.unshift('.vue');
        cssExtensions.unshift('vue');
    }
    cssProcessors.less && cssExtensions.push('less');
    cssProcessors.sass && cssExtensions.push('sass');
    cssProcessors.scss && cssExtensions.push('scss');
    const commonAlias = Object.keys(paths).reduce((obj, name) => {
        const target = path_1.default.resolve(path_1.default.dirname(tsconfigPath), baseUrl, paths[name][0].replace(/\/\*$/, ''));
        if (name.endsWith('/*')) {
            obj[name.replace(/\/\*$/, '')] = target;
        }
        else {
            obj[`${name}$`] = target;
        }
        return obj;
    }, {});
    const clientAlias = {};
    const serverAlias = {};
    Object.keys(resolveAlias).forEach((key) => {
        let target = resolveAlias[key];
        if (target.startsWith('./')) {
            target = path_1.default.join(rootPath, target);
        }
        if (key.startsWith('server//')) {
            serverAlias[key.replace('server//', '')] = target;
        }
        else if (key.startsWith('client//')) {
            clientAlias[key.replace('server//', '')] = target;
        }
        else {
            commonAlias[key] = target;
        }
    });
    const SsrPlugin = ssr_inject_1.default(path_1.default.join(distPath, './server/main.js'), path_1.default.join(distPath, './client/index.html'));
    const clientWebpackConfig = {
        cache,
        context: rootPath,
        name: 'client',
        mode: nodeEnv,
        target: 'browserslist',
        stats: 'minimal',
        devtool: sourceMap,
        entry: path_1.default.join(srcPath, './index'),
        performance: false,
        watchOptions: {
            ignored: /node_modules/,
        },
        ignoreWarnings: [/export .* was not found in/, /Critical dependency:\s+require function.*/],
        output: {
            publicPath: clientPublicPath,
            path: path_1.default.join(distPath, './client'),
            hashDigestLength: 8,
            filename: isProdModel ? 'js/[name].[contenthash].js' : 'js/[name].js',
        },
        resolve: { extensions: [...scriptExtensions, '.json'], alias: { ...commonAlias, ...clientAlias } },
        optimization: {
            minimizer: ['...', new CssMinimizerPlugin()],
        },
        module: {
            rules: [
                isVue && {
                    test: /\.vue$/,
                    use: {
                        loader: 'vue-loader',
                    },
                },
                moduleFederation && {
                    test: /src[/\\]bootstrap\.ts$/,
                    loader: 'bundle-loader',
                    options: {
                        lazy: true,
                    },
                },
                {
                    oneOf: [
                        {
                            test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                            use: getUrlLoader(isProdModel, 'imgs', false, limitSize),
                        },
                        {
                            test: /\.(svg)(\?.*)?$/,
                            use: getUrlLoader(isProdModel, 'imgs', true, limitSize),
                        },
                        {
                            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                            use: getUrlLoader(isProdModel, 'media', false, limitSize),
                        },
                        {
                            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                            use: getUrlLoader(isProdModel, 'fonts', false, limitSize),
                        },
                        {
                            test: /\.(jsx|js)$/,
                            exclude: /node_modules/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    plugins: !isVue && !isProdModel ? [require.resolve('react-refresh/babel')] : [],
                                },
                            },
                        },
                        {
                            test: /\.ts$/,
                            oneOf: oneOfTsLoader(isProdModel, isVue, false),
                        },
                        {
                            test: /\.tsx$/,
                            use: tsxLoaders(isProdModel, isVue, false),
                        },
                        {
                            test: /\.css$/,
                            oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssModulesOptions, ''),
                        },
                        cssProcessors.less && {
                            test: /\.less$/,
                            oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssModulesOptions, cssProcessors.less === true ? 'less' : cssProcessors.less),
                        },
                        cssProcessors.sass && {
                            test: /\.sass$/,
                            oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssModulesOptions, cssProcessors.sass === true ? 'sass' : cssProcessors.sass),
                        },
                        cssProcessors.scss && {
                            test: /\.scss$/,
                            oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssModulesOptions, cssProcessors.scss === true ? 'scss' : cssProcessors.scss),
                        },
                    ].filter(Boolean),
                },
            ].filter(Boolean),
        },
        plugins: [
            moduleFederation && new ModuleFederationPlugin(moduleFederation),
            isVue && new VueLoaderPlugin(),
            isVue
                ? new ForkTsCheckerWebpackPlugin({
                    typescript: {
                        configFile: tsconfigPath,
                        diagnosticOptions: {
                            semantic: true,
                            syntactic: false,
                        },
                        extensions: { vue: { enabled: true, compiler: '@vue/compiler-sfc' } },
                    },
                })
                : new ForkTsCheckerWebpackPlugin({
                    typescript: {
                        configFile: tsconfigPath,
                        diagnosticOptions: {
                            semantic: true,
                            syntactic: true,
                        },
                    },
                }),
            enableEslintPlugin && new EslintWebpackPlugin({ cache: true, extensions: scriptExtensions }),
            enableStylelintPlugin && new StylelintPlugin({ files: `src/**/*.{${cssExtensions.join(',')}}` }),
            new webpack_1.default.DefinePlugin({
                'process.env.PROJ_ENV': JSON.stringify(globalVar.client || {}),
            }),
            new HtmlWebpackPlugin({
                clientPublicPath: clientPublicPath,
                minify: false,
                inject: 'body',
                template: path_1.default.join(publicPath, './client/index.html'),
            }),
            isProdModel &&
                new MiniCssExtractPlugin({
                    ignoreOrder: true,
                    filename: 'css/[name].[contenthash].css',
                }),
            useSSR && SsrPlugin.client,
            !isProdModel && !isVue && new ReactRefreshWebpackPlugin({ overlay: false }),
            new webpack_1.default.ProgressPlugin(),
        ].filter(Boolean),
    };
    const serverWebpackConfig = useSSR
        ? {
            cache,
            context: rootPath,
            name: 'server',
            mode: nodeEnv,
            target: 'node',
            stats: 'minimal',
            optimization: {
                minimize: false,
            },
            devtool: sourceMap,
            watchOptions: {
                ignored: /node_modules/,
            },
            ignoreWarnings: [/export .* was not found in/, /Critical dependency:\s+require function.*/],
            entry: path_1.default.join(srcPath, './server'),
            output: {
                libraryTarget: 'commonjs2',
                publicPath: clientPublicPath,
                path: path_1.default.join(distPath, './server'),
                hashDigestLength: 8,
                filename: '[name].js',
            },
            resolve: { extensions: [...scriptExtensions, '.json'], alias: { ...commonAlias, ...serverAlias } },
            module: {
                rules: [
                    isVue && {
                        test: /\.vue$/,
                        use: {
                            loader: 'vue-loader',
                        },
                    },
                    {
                        oneOf: [
                            {
                                test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                                use: getUrlLoader(isProdModel, 'imgs', false, limitSize),
                            },
                            {
                                test: /\.(svg)(\?.*)?$/,
                                use: getUrlLoader(isProdModel, 'imgs', true, limitSize),
                            },
                            {
                                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                                use: getUrlLoader(isProdModel, 'media', false, limitSize),
                            },
                            {
                                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                                use: getUrlLoader(isProdModel, 'fonts', false, limitSize),
                            },
                            {
                                test: /\.(jsx|js)$/,
                                exclude: /node_modules/,
                                use: {
                                    loader: 'babel-loader',
                                    options: {},
                                },
                            },
                            {
                                test: /\.ts$/,
                                oneOf: oneOfTsLoader(isProdModel, isVue, true),
                            },
                            {
                                test: /\.tsx$/,
                                use: tsxLoaders(isProdModel, isVue, true),
                            },
                            {
                                test: /\.css$/,
                                oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssModulesOptions, ''),
                            },
                            cssProcessors.less && {
                                test: /\.less$/,
                                oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssModulesOptions, cssProcessors.less === true ? 'less' : cssProcessors.less),
                            },
                            cssProcessors.sass && {
                                test: /\.sass$/,
                                oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssModulesOptions, cssProcessors.sass === true ? 'sass' : cssProcessors.sass),
                            },
                            cssProcessors.scss && {
                                test: /\.scss$/,
                                oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssModulesOptions, cssProcessors.scss === true ? 'scss' : cssProcessors.scss),
                            },
                        ].filter(Boolean),
                    },
                ].filter(Boolean),
            },
            plugins: [
                isVue && new VueLoaderPlugin(),
                SsrPlugin.server,
                new webpack_1.default.DefinePlugin({
                    'process.env.PROJ_ENV': JSON.stringify(globalVar.server || {}),
                }),
                new webpack_1.default.ProgressPlugin(),
            ].filter(Boolean),
        }
        : { name: 'server' };
    const devServerConfig = {
        static: [
            { publicPath: clientPublicPath, directory: path_1.default.join(envPath, './client') },
            {
                publicPath: clientPublicPath,
                directory: path_1.default.join(publicPath, './client'),
                staticOptions: { fallthrough: false },
            },
        ],
        historyApiFallback: { index: '/client/index.html' },
        proxy: apiProxy,
        port: serverPort,
        client: {
            overlay: {
                warnings: false,
                errors: true,
            },
        },
    };
    if (useSSR) {
        devServerConfig.historyApiFallback = false;
        devServerConfig.devMiddleware = { serverSideRender: true };
        devServerConfig.onAfterSetupMiddleware = function (devServer) {
            devServer.app.use((req, res, next) => {
                const passUrls = [/\w+.hot-update.\w+$/];
                if (passUrls.some((reg) => reg.test(req.url))) {
                    next();
                }
                else {
                    const serverBundle = require(SsrPlugin.getEntryPath(res));
                    try {
                        serverBundle
                            .default(req, res)
                            .then((str) => {
                            res.end(str);
                        })
                            .catch((e) => {
                            cli_utils_1.err(e.toString());
                            res.status(500).end(`error: ${e.message}`);
                        });
                    }
                    catch (e) {
                        cli_utils_1.err(e.toString());
                        res.status(500).end(`error: ${e.message}`);
                    }
                }
            });
        };
    }
    return { clientWebpackConfig, serverWebpackConfig, devServerConfig };
}
module.exports = moduleExports;