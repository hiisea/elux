/* eslint-disable no-console */
import {Express} from 'express';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const {getSsrInjectPlugin} = require('@elux/dev-webpack/dist/plugin/ssr-inject');
const {VueLoaderPlugin} = require('vue-loader');

interface WebpackLoader {
  loader?: string;
  options?: Record<string, any>;
  [key: string]: any;
}

interface WebpackConfig {
  name: 'client' | 'server';
  [key: string]: any;
}

interface DevServerConfig {
  port?: number;
  https?: boolean;
  host?: string;
  devMiddleware?: {publicPath?: string; serverSideRender?: boolean};
  onAfterSetupMiddleware?: (server: Express) => void;
  [key: string]: any;
}

function getCssScopedName(srcPath: string, localName: string, mfileName: string) {
  if (mfileName.match(/[/\\]global.module.\w+?$/)) {
    return `g-${localName}`;
  }
  mfileName = mfileName
    .replace(srcPath, '')
    .replace(/\W/g, '-')
    .replace(/^-|-index-module-\w+$|-module-\w+$|-index-vue$|-vue$/g, '')
    .replace(/^components-/, 'comp-')
    .replace(/^modules-.*?(\w+)-views(-?)(.*)/, '$1$2$3')
    .replace(/^modules-.*?(\w+)-components(-?)(.*)/, '$1-comp$2$3');
  return localName === 'root' ? mfileName : `${mfileName}_${localName}`;
}

function getUrlLoader(isProdModel: boolean, type: string, disable: boolean, limitSize: number): WebpackLoader {
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

function oneOfCssLoader(
  isProdModel: boolean,
  srcPath: string,
  isVue: boolean,
  isServer: boolean,
  extensionLoader: WebpackLoader | 'less' | 'sass' | 'scss' | ''
): WebpackLoader[] {
  let cssProcessors: WebpackLoader | null = null;
  if (extensionLoader === 'less') {
    cssProcessors = {
      loader: 'less-loader',
    };
  } else if (extensionLoader === 'sass') {
    cssProcessors = {
      loader: 'sass-loader',
    };
  } else if (extensionLoader === 'scss') {
    cssProcessors = {
      loader: 'scss-loader',
    };
  } else if (extensionLoader) {
    cssProcessors = extensionLoader;
  }
  const styleLoader = isProdModel
    ? {loader: MiniCssExtractPlugin.loader}
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
        // localIdentName: '[name]_[local]_[hash:base64:5]',
        getLocalIdent: (context: {resourcePath: string}, localIdentName: string, localName: string) => {
          return getCssScopedName(srcPath, localName, context.resourcePath);
        },
        localIdentContext: srcPath,
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
  const withModule = (isServer ? [cssLoaderWithModule, cssProcessors] : [styleLoader, cssLoaderWithModule, postcssLoader, cssProcessors]).filter(
    Boolean
  ) as WebpackLoader[];
  const withoutModule = (isServer ? ['null-loader'] : [styleLoader, cssLoader, postcssLoader, cssProcessors].filter(Boolean)) as WebpackLoader[];
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
        {use: withoutModule},
      ]
    : [
        {
          test: /\.module\.\w+$/,
          use: withModule,
        },
        {use: withoutModule},
      ];
}

function oneOfTsLoader(isProdModel: boolean, isVue: boolean, isServer: boolean): WebpackLoader[] {
  const loaders: WebpackLoader[] = [
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
  } else if (!isServer && !isProdModel) {
    loaders[0].options = {
      plugins: [require.resolve('react-refresh/babel')],
    };
  }
  if (isProdModel || isServer) {
    return [{use: loaders}];
  }
  return [
    {
      test: /[/\\]src[/\\]modules[/\\].+[/\\]index\.ts$/,
      use: [...loaders, {loader: '@elux/dev-webpack/dist/loader/module-hot-loader'}],
    },
    {use: loaders},
  ];
}

interface ConfigOptions {
  debugMode: boolean;
  nodeEnv: 'production' | 'development';
  rootPath: string;
  srcPath: string;
  distPath: string;
  publicPath: string;
  clientPublicPath: string;
  envPath: string;
  cssProcessors: {less?: WebpackLoader | boolean; sass?: WebpackLoader | boolean; scss?: WebpackLoader | boolean};
  limitSize: number;
  globalVar: {client?: any; server?: any};
  apiProxy: {[key: string]: any};
  useSSR: boolean;
  vueType: 'templete' | 'jsx' | '';
  devServerPort: number;
  resolveAlias: Record<string, string>;
}

function moduleExports({
  debugMode,
  nodeEnv,
  rootPath,
  srcPath,
  distPath,
  publicPath,
  clientPublicPath,
  envPath,
  cssProcessors,
  vueType,
  limitSize,
  globalVar,
  apiProxy,
  useSSR,
  devServerPort,
  resolveAlias,
}: ConfigOptions): {clientWebpackConfig: WebpackConfig; serverWebpackConfig: WebpackConfig; devServerConfig: DevServerConfig} {
  /**
   * webpackConfig.output.path 决定生成文件的物理path ,output.publicPath 仅决定html中引入的url
   * devServer只将第一个 webpackConfig 中的output.path设置为生成目录
   * devServer.dev.publicPath，为webpackConfig生成目录设置访问路径，默认为'/'，该参数直接传递给webpack-dev-middleware
   * devServer.static.publicPath 为静态目录设置访问路径，默认为'/'
   */
  const isProdModel = nodeEnv === 'production';
  let clentDevtool: boolean | string = debugMode ? 'eval-cheap-module-source-map' : 'eval';
  let serverDevtool: boolean | string = debugMode ? 'eval-cheap-module-source-map' : 'eval';
  if (isProdModel) {
    clentDevtool = debugMode ? 'cheap-module-source-map' : false;
    serverDevtool = false;
  }
  if (!isProdModel) {
    clientPublicPath = '/client/';
  }
  const isVue = !!vueType;
  const tsconfigPathTest: string[] = [path.join(srcPath, 'tsconfig.json'), path.join(rootPath, 'tsconfig.json')];
  const tsconfigPath = fs.existsSync(tsconfigPathTest[0]) ? tsconfigPathTest[0] : tsconfigPathTest[1];
  const scriptExtensions = !vueType
    ? ['.js', '.jsx', '.ts', '.tsx']
    : vueType === 'jsx'
    ? ['.js', '.jsx', '.ts', '.tsx', 'vue']
    : ['.js', '.ts', 'vue'];
  const cssExtensions = !vueType ? ['css'] : ['css', 'vue'];
  cssProcessors.less && cssExtensions.push('less');
  cssProcessors.sass && cssExtensions.push('sass');
  cssProcessors.scss && cssExtensions.push('scss');
  const resolve = {
    extensions: [...scriptExtensions, '.json'],
    alias: Object.keys(resolveAlias).reduce((obj, key) => {
      const target = resolveAlias[key];
      if (target.startsWith('./')) {
        obj[key] = path.join(rootPath, target);
      } else {
        obj[key] = target;
      }
      return obj;
    }, {}),
  };
  if (isVue) {
    resolve.alias['vue$'] = 'vue/dist/vue.runtime.esm-bundler.js';
  }
  const SsrPlugin = getSsrInjectPlugin();
  const clientWebpackConfig: WebpackConfig = {
    context: rootPath,
    name: 'client',
    mode: nodeEnv,
    target: 'browserslist',
    stats: 'minimal',
    devtool: clentDevtool,
    entry: path.join(srcPath, './index'),
    performance: false,
    watchOptions: {
      ignored: /node_modules/,
    },
    ignoreWarnings: [/export .* was not found in/],
    output: {
      publicPath: clientPublicPath,
      path: path.join(distPath, './client'),
      hashDigestLength: 8,
      filename: isProdModel ? 'js/[name].[contenthash].js' : 'js/[name].js',
    },
    resolve,
    optimization: {
      // minimize: false,
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
              test: /\.(tsx|ts)$/,
              oneOf: oneOfTsLoader(isProdModel, isVue, false),
            },
            {
              test: /\.css$/,
              oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, ''),
            },
            cssProcessors.less && {
              test: /\.less$/,
              oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssProcessors.less === true ? 'less' : cssProcessors.less),
            },
            cssProcessors.sass && {
              test: /\.sass$/,
              oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssProcessors.sass === true ? 'sass' : cssProcessors.sass),
            },
            cssProcessors.scss && {
              test: /\.scss$/,
              oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, false, cssProcessors.scss === true ? 'scss' : cssProcessors.scss),
            },
          ].filter(Boolean),
        },
      ].filter(Boolean),
    },
    plugins: [
      isVue && new VueLoaderPlugin(),
      isVue
        ? new ForkTsCheckerWebpackPlugin({
            typescript: {
              configFile: tsconfigPath,
              diagnosticOptions: {
                semantic: true,
                syntactic: false,
              },
              extensions: {vue: {enabled: true, compiler: '@vue/compiler-sfc'}},
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
      new EslintWebpackPlugin({cache: true, extensions: scriptExtensions}),
      new StylelintPlugin({files: `src/**/*.{${cssExtensions.join(',')}}`}),
      new HtmlWebpackPlugin({
        minify: false,
        inject: 'body',
        template: path.join(publicPath, './client/index.html'),
      }),
      new HtmlReplaceWebpackPlugin([
        {
          pattern: '$$ClientPublicPath$$',
          replacement: clientPublicPath,
        },
        {
          pattern: '$$ClientGlobalVar$$',
          replacement: JSON.stringify(globalVar.client || {}),
        },
      ]),
      isProdModel &&
        new MiniCssExtractPlugin({
          ignoreOrder: true,
          filename: 'css/[name].[contenthash].css',
        }),
      useSSR && SsrPlugin,
      !isProdModel && !isVue && new ReactRefreshWebpackPlugin({overlay: false}),
      !isProdModel && new webpack.HotModuleReplacementPlugin(),
      new webpack.ProgressPlugin(),
    ].filter(Boolean),
  };

  const serverWebpackConfig: WebpackConfig = useSSR
    ? {
        context: rootPath,
        name: 'server',
        mode: nodeEnv,
        target: 'node',
        stats: 'minimal',
        optimization: {
          minimize: false,
        },
        devtool: serverDevtool,
        watchOptions: {
          ignored: /node_modules/,
        },
        ignoreWarnings: [/export .* was not found in/],
        entry: path.join(srcPath, './server'),
        output: {
          libraryTarget: 'commonjs2',
          publicPath: clientPublicPath,
          path: path.join(distPath, './server'),
          hashDigestLength: 8,
          filename: '[name].js',
        },
        resolve,
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
                  test: /\.(tsx|ts)$/,
                  oneOf: oneOfTsLoader(isProdModel, isVue, true),
                },
                {
                  test: /\.css$/,
                  oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, ''),
                },
                cssProcessors.less && {
                  test: /\.less$/,
                  oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssProcessors.less === true ? 'less' : cssProcessors.less),
                },
                cssProcessors.sass && {
                  test: /\.sass$/,
                  oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssProcessors.sass === true ? 'sass' : cssProcessors.sass),
                },
                cssProcessors.scss && {
                  test: /\.scss$/,
                  oneOf: oneOfCssLoader(isProdModel, srcPath, isVue, true, cssProcessors.scss === true ? 'scss' : cssProcessors.scss),
                },
              ].filter(Boolean),
            },
          ].filter(Boolean),
        },
        plugins: [isVue && new VueLoaderPlugin(), SsrPlugin, new webpack.ProgressPlugin()].filter(Boolean),
      }
    : {name: 'server'};

  global['ENV'] = globalVar.server;

  const devServerConfig: DevServerConfig = {
    static: [
      {publicPath: clientPublicPath, directory: path.join(envPath, './client')},
      {
        publicPath: clientPublicPath,
        directory: path.join(publicPath, './client'),
        staticOptions: {fallthrough: false},
      },
    ],
    historyApiFallback: {index: '/client/index.html'},
    proxy: apiProxy,
    port: devServerPort,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  };
  if (useSSR) {
    devServerConfig.historyApiFallback = false;
    devServerConfig.devMiddleware = {serverSideRender: true};
    devServerConfig.onAfterSetupMiddleware = function (server: Express) {
      server.use((req, res, next) => {
        const passUrls = [/\w+.hot-update.\w+$/];
        if (passUrls.some((reg) => reg.test(req.url))) {
          next();
        } else {
          const serverBundle = require(SsrPlugin.getEntryPath(res));
          try {
            serverBundle
              .default(req, res)
              .then((str: string) => {
                res.end(str);
              })
              .catch((e: Error) => {
                console.error(e);
                res.status(500).end(`error: ${e.message}`);
              });
          } catch (e) {
            console.error(e);
            res.status(500).end(`error: ${e.message}`);
          }
        }
      });
    };
  }
  return {clientWebpackConfig, serverWebpackConfig, devServerConfig};
}

declare namespace moduleExports {
  export {ConfigOptions, WebpackLoader, WebpackConfig, DevServerConfig};
}
export = moduleExports;
