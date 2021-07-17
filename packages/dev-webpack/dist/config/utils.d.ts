import { Express } from 'express';
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
    devMiddleware?: {
        publicPath?: string;
        serverSideRender?: boolean;
    };
    onAfterSetupMiddleware?: (server: Express) => void;
    [key: string]: any;
}
interface ConfigOptions {
    cache: boolean | Record<string, any>;
    sourceMap: string;
    nodeEnv: 'production' | 'development';
    rootPath: string;
    srcPath: string;
    distPath: string;
    publicPath: string;
    clientPublicPath: string;
    envPath: string;
    cssProcessors: {
        less?: WebpackLoader | boolean;
        sass?: WebpackLoader | boolean;
        scss?: WebpackLoader | boolean;
    };
    cssModulesOptions: Record<string, any>;
    limitSize: number;
    globalVar: {
        client?: any;
        server?: any;
    };
    apiProxy: {
        [key: string]: any;
    };
    useSSR: boolean;
    UIType: 'react' | 'vue';
    serverPort: number;
    resolveAlias: Record<string, string>;
    moduleFederation?: Record<string, any>;
    enableEslintPlugin: boolean;
    enableStylelintPlugin: boolean;
}
declare function moduleExports({ cache, sourceMap, nodeEnv, rootPath, srcPath, distPath, publicPath, clientPublicPath, envPath, cssProcessors, cssModulesOptions, enableEslintPlugin, enableStylelintPlugin, UIType, limitSize, globalVar, apiProxy, useSSR, serverPort, resolveAlias, moduleFederation, }: ConfigOptions): {
    clientWebpackConfig: WebpackConfig;
    serverWebpackConfig: WebpackConfig;
    devServerConfig: DevServerConfig;
};
declare namespace moduleExports {
    export { ConfigOptions, WebpackLoader, WebpackConfig, DevServerConfig };
}
export = moduleExports;
