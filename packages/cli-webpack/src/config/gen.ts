import path from 'path';
import {fs, deepExtend} from '@elux/cli-utils';
import {validate} from 'schema-utils';
import genConfig from './utils';
import type {WebpackLoader, WebpackConfig, DevServerConfig} from './utils';

interface EnvConfig {
  clientPublicPath: string;
  clientGlobalVar: Record<string, any>;
  serverGlobalVar: Record<string, any>;
  onCompiled: () => void;
  sourceMap: string;
  cache: boolean | Record<string, any>;
  eslint: boolean;
  stylelint: boolean;
  resolveAlias: Record<string, string>;
  urlLoaderLimitSize: number;
  apiProxy: Record<string, {target: string}>;
  serverPort: number;
  webpackConfigTransform: (config: WebpackConfig) => WebpackConfig;
}

interface EluxConfig {
  type: 'vue' | 'react' | 'vue ssr' | 'react ssr';
  dir: {
    srcPath: string;
    distPath: string;
    publicPath: string;
    mockPath: string;
    envPath: string;
  };
  cssProcessors: {less: WebpackLoader | boolean; scss: WebpackLoader | boolean; sass: WebpackLoader | boolean};
  cssModulesOptions: Record<string, any>;
  moduleFederation: Record<string, any>;
  devServerConfigTransform: (config: DevServerConfig) => DevServerConfig;
  mockServer: {port: number};
  all: EnvConfig;
  dev?: Partial<EnvConfig>;
  prod?: Partial<EnvConfig>;
}

const EluxConfigSchema: any = {
  type: 'object',
  additionalProperties: false,
  definitions: {
    CssLoader: {type: 'object', properties: {loader: {type: 'string'}}},
    EnvConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        clientPublicPath: {type: 'string'},
        clientGlobalVar: {type: 'object'},
        serverGlobalVar: {type: 'object'},
        onCompiled: {instanceof: 'Function'},
        sourceMap: {type: 'string'},
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
        eslint: {type: 'boolean'},
        stylelint: {type: 'boolean'},
        resolveAlias: {
          type: 'object',
        },
        urlLoaderLimitSize: {
          type: 'number',
          description: 'Default is 8192',
        },
        apiProxy: {type: 'object'},
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

interface Info {
  devServerConfig: DevServerConfig;
  clientWebpackConfig: WebpackConfig;
  serverWebpackConfig: WebpackConfig;
  projectConfig: {
    projectType: 'vue' | 'react' | 'vue ssr' | 'react ssr';
    nodeEnv: 'production' | 'development';
    cache: string;
    rootPath: string;
    projEnv: string;
    srcPath: string;
    distPath: string;
    publicPath: string;
    envPath: string;
    envConfig: EnvConfig;
    useSSR: boolean;
    serverPort: number;
    apiProxy: Record<string, {target: string}>;
    sourceMap: string;
    onCompiled: () => void;
  };
}

function moduleExports(rootPath: string, projEnv: string, nodeEnv: 'production' | 'development', _serverPort?: number): Info {
  const baseEluxConfig: Partial<EluxConfig> = fs.existsSync(path.join(rootPath, 'elux.config.js'))
    ? require(path.join(rootPath, 'elux.config.js'))
    : {};
  validate(EluxConfigSchema, baseEluxConfig, {name: '@elux/EluxConfig'});
  const envPath = baseEluxConfig.dir?.envPath || './env';
  const projEnvPath = path.resolve(rootPath, envPath, `./${projEnv}`);
  fs.ensureDirSync(projEnvPath);
  const envEluxConfig: Partial<EluxConfig> = fs.existsSync(path.join(projEnvPath, `elux.config.js`))
    ? require(path.join(projEnvPath, `elux.config.js`))
    : {};
  validate(EluxConfigSchema, envEluxConfig, {name: '@elux/EluxConfig'});
  const defaultBaseConfig: EluxConfig = {
    type: 'react',
    dir: {
      srcPath: './src',
      distPath: './dist',
      publicPath: './public',
      mockPath: './mock',
      envPath: './env',
    },
    cssProcessors: {less: false, scss: false, sass: false},
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
    mockServer: {port: 3003},
  };
  const eluxConfig: EluxConfig = deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);
  const envConfig: EnvConfig = deepExtend(eluxConfig.all, eluxConfig[nodeEnv === 'development' ? 'dev' : 'prod']);

  const {
    dir: {srcPath, publicPath},
    type,
    moduleFederation,
    devServerConfigTransform,
    cssProcessors,
    cssModulesOptions,
  } = eluxConfig;

  const {
    serverPort,
    cache,
    eslint,
    stylelint,
    urlLoaderLimitSize,
    resolveAlias,
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
    sourceMap,
    onCompiled,
    webpackConfigTransform,
    apiProxy,
  } = envConfig;

  const useSSR = type === 'react ssr' || type === 'vue ssr';
  const UIType = type.split(' ')[0] as 'react' | 'vue';
  const distPath = path.resolve(rootPath, eluxConfig.dir.distPath, projEnv);

  let {devServerConfig, clientWebpackConfig, serverWebpackConfig} = genConfig({
    cache,
    sourceMap,
    nodeEnv,
    rootPath,
    srcPath: path.resolve(rootPath, srcPath),
    distPath: path.resolve(rootPath, distPath),
    publicPath: path.resolve(rootPath, publicPath),
    clientPublicPath,
    envPath: projEnvPath,
    cssProcessors,
    cssModulesOptions,
    enableEslintPlugin: eslint,
    enableStylelintPlugin: stylelint,
    UIType,
    limitSize: urlLoaderLimitSize,
    globalVar: {client: clientGlobalVar, server: serverGlobalVar},
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
      srcPath: path.resolve(rootPath, srcPath),
      distPath: path.resolve(rootPath, distPath),
      publicPath: path.resolve(rootPath, publicPath),
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

declare namespace moduleExports {
  export {EnvConfig, EluxConfig, Info, WebpackLoader, WebpackConfig, DevServerConfig};
}

export = moduleExports;
