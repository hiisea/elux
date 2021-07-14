import path from 'path';
import fs from 'fs-extra';
import deepExtend from 'deep-extend';
import {validate} from 'schema-utils';
import genConfig from './utils';
import type {WebpackLoader, WebpackConfig, DevServerConfig} from './utils';

interface EnvConfig {
  clientPublicPath: string;
  clientGlobalVar: Record<string, any>;
  serverGlobalVar: Record<string, any>;
  onCompiled: () => void;
}
interface ProjConfig {
  development: EnvConfig;
  production: EnvConfig;
}
interface WebpackPreset {
  resolveAlias: Record<string, string>;
  urlLoaderLimitSize: number;
  cssProcessors: {less: WebpackLoader | boolean; scss: WebpackLoader | boolean; sass: WebpackLoader | boolean};
}
interface DevServerPreset {
  port: number;
  proxy: Record<string, {target: string}>;
}
interface MockServerPreset {
  port: number;
}
interface BaseConfig {
  type: 'vue' | 'react' | 'vue ssr' | 'react ssr';
  dir: {
    srcPath: string;
    distPath: string;
    publicPath: string;
    mockPath: string;
    envPath: string;
  };
  ui: {
    vueWithJSX: boolean;
  };
  moduleFederation: Record<string, any>;
  mockServerPreset: MockServerPreset;
  webpackPreset: WebpackPreset;
  webpackConfig: (config: WebpackConfig) => WebpackConfig;
  devServerPreset: DevServerPreset;
  devServerConfig: (config: DevServerConfig) => DevServerConfig;
}
interface EluxConfig extends BaseConfig, ProjConfig {}
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
      },
    },
  },
  properties: {
    type: {
      enum: ['vue', 'vue ssr', 'react', 'react ssr'],
    },
    webpackConfig: {
      instanceof: 'Function',
      description: 'Provides an custom function to transform webpackConfig: (webpackConfig) => webpackConfig',
    },
    devServerConfig: {
      instanceof: 'Function',
      description: 'Provides an custom function to transform webpack devServerConfig: (devServerConfig) => devServerConfig',
    },
    webpackPreset: {
      type: 'object',
      additionalProperties: false,
      properties: {
        urlLoaderLimitSize: {
          type: 'number',
          description: 'Default is 8192',
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
        resolveAlias: {
          type: 'object',
        },
      },
    },
    devServerPreset: {
      type: 'object',
      additionalProperties: false,
      properties: {
        port: {
          type: 'number',
          description: 'Default is 4003',
        },
        proxy: {type: 'object'},
      },
    },
    mockServerPreset: {
      type: 'object',
      additionalProperties: false,
      properties: {
        port: {
          type: 'number',
          description: 'Default is 3003',
        },
      },
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
    moduleFederation: {
      type: 'object',
    },
    ui: {
      type: 'object',
      additionalProperties: false,
      properties: {
        vueWithJSX: {
          type: 'boolean',
          description: 'Default is false, vue renderer with templete style',
        },
      },
    },
    development: {
      $ref: '#/definitions/EnvConfig',
    },
    production: {
      $ref: '#/definitions/EnvConfig',
    },
  },
};
// const rootPath = process.cwd();
// const projEnv = process.env.PROJ_ENV || 'local';
// const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
// const debugMode = !!process.env.DEBUG;
interface Config {
  devServerConfig: DevServerConfig;
  clientWebpackConfig: WebpackConfig;
  serverWebpackConfig: WebpackConfig;
  projectConfig: {
    rootPath: string;
    projEnv: string;
    nodeEnv: 'production' | 'development';
    srcPath: string;
    distPath: string;
    publicPath: string;
    envPath: string;
    debugMode: string;
    projectType: 'vue' | 'react' | 'vue ssr' | 'react ssr';
    nodeEnvConfig: EnvConfig;
    vueRender: '' | 'templete' | 'jsx';
    useSSR: boolean;
    port: number;
    proxy: Record<string, {target: string}>;
    onCompiled: () => void;
  };
}

function moduleExports(rootPath: string, projEnv: string, nodeEnv: 'production' | 'development', debugMode: boolean, devServerPort?: number): Config {
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
    ui: {
      vueWithJSX: false,
    },
    webpackPreset: {
      resolveAlias: {},
      urlLoaderLimitSize: 8192,
      cssProcessors: {less: false, scss: false, sass: false},
    },
    moduleFederation: {},
    webpackConfig: (config) => config,
    devServerPreset: {
      port: 4003,
      proxy: {},
    },
    devServerConfig: (config) => config,
    mockServerPreset: {
      port: 3003,
    },
    development: {clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {}, onCompiled: () => undefined},
    production: {clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {}, onCompiled: () => undefined},
  };
  const eluxConfig: EluxConfig = deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);

  const nodeEnvConfig = eluxConfig[nodeEnv];
  const {clientPublicPath, clientGlobalVar, serverGlobalVar, onCompiled} = nodeEnvConfig;
  const {
    dir: {srcPath, publicPath},
    type,
    ui: {vueWithJSX},
    moduleFederation,
    webpackPreset,
    webpackConfig: webpackConfigTransform,
    devServerConfig: devServerConfigTransform,
    devServerPreset: {port, proxy},
  } = eluxConfig;

  const useSSR = type === 'react ssr' || type === 'vue ssr';
  let vueType: 'templete' | 'jsx' | '' = '';
  if (type === 'vue' || type === 'vue ssr') {
    vueType = vueWithJSX ? 'jsx' : 'templete';
  }

  const distPath = path.resolve(rootPath, eluxConfig.dir.distPath, projEnv);
  let {devServerConfig, clientWebpackConfig, serverWebpackConfig} = genConfig({
    debugMode,
    nodeEnv,
    rootPath,
    srcPath: path.resolve(rootPath, srcPath),
    distPath: path.resolve(rootPath, distPath),
    publicPath: path.resolve(rootPath, publicPath),
    clientPublicPath,
    envPath: projEnvPath,
    cssProcessors: webpackPreset.cssProcessors,
    vueType,
    limitSize: webpackPreset.urlLoaderLimitSize,
    globalVar: {client: clientGlobalVar, server: serverGlobalVar},
    apiProxy: proxy,
    useSSR,
    devServerPort: devServerPort || port,
    resolveAlias: webpackPreset.resolveAlias,
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
      debugMode: (useSSR ? `client ${clientWebpackConfig.devtool} server ${serverWebpackConfig.devtool}` : clientWebpackConfig.devtool) as string,
      projectType: type,
      nodeEnvConfig,
      vueRender: vueType,
      useSSR,
      port,
      proxy,
      onCompiled,
    },
  };
}

declare namespace moduleExports {
  export {EnvConfig, ProjConfig, WebpackPreset, DevServerPreset, BaseConfig, EluxConfig, Config, WebpackLoader, WebpackConfig, DevServerConfig};
}

export = moduleExports;
