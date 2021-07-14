import type { WebpackLoader, WebpackConfig, DevServerConfig } from './utils';
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
    cssProcessors: {
        less: WebpackLoader | boolean;
        scss: WebpackLoader | boolean;
        sass: WebpackLoader | boolean;
    };
}
interface DevServerPreset {
    port: number;
    proxy: Record<string, {
        target: string;
    }>;
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
interface EluxConfig extends BaseConfig, ProjConfig {
}
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
        proxy: Record<string, {
            target: string;
        }>;
        onCompiled: () => void;
    };
}
declare function moduleExports(rootPath: string, projEnv: string, nodeEnv: 'production' | 'development', debugMode: boolean, devServerPort?: number): Config;
declare namespace moduleExports {
    export { EnvConfig, ProjConfig, WebpackPreset, DevServerPreset, BaseConfig, EluxConfig, Config, WebpackLoader, WebpackConfig, DevServerConfig };
}
export = moduleExports;
