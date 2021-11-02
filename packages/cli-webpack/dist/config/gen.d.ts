import type { WebpackLoader, WebpackConfig, DevServerConfig } from './utils';
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
    apiProxy: Record<string, {
        target: string;
    }>;
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
    cssProcessors: {
        less: WebpackLoader | boolean;
        scss: WebpackLoader | boolean;
        sass: WebpackLoader | boolean;
    };
    cssModulesOptions: Record<string, any>;
    moduleFederation: Record<string, any>;
    devServerConfigTransform: (config: DevServerConfig) => DevServerConfig;
    mockServer: {
        port: number;
    };
    all: EnvConfig;
    dev?: Partial<EnvConfig>;
    prod?: Partial<EnvConfig>;
}
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
        apiProxy: Record<string, {
            target: string;
        }>;
        sourceMap: string;
        onCompiled: () => void;
    };
}
declare function moduleExports(rootPath: string, projEnv: string, nodeEnv: 'production' | 'development', _serverPort?: number): Info;
declare namespace moduleExports {
    export { EnvConfig, EluxConfig, Info, WebpackLoader, WebpackConfig, DevServerConfig };
}
export = moduleExports;
