import { Compiler } from 'webpack';
interface Options {
    htmlFilePath: string;
    entryFilePath: string;
}
declare class Core {
    readonly htmlFilePath: string;
    readonly entryFilePath: string;
    readonly htmlKey: string;
    private htmlCode;
    private jsCode;
    private webpackFS;
    constructor(options: Options);
    setWebpackFS(webpackFS: any): void;
    setHtmlCode(htmlCode: string): void;
    setJSCode(jsCode: string): void;
    replaceCode(): void;
}
declare class ServerPlugin {
    ssrCore: Core;
    constructor(ssrCore: Core);
    apply(compiler: Compiler): void;
}
declare class ClientPlugin {
    ssrCore: Core;
    constructor(ssrCore: Core);
    apply(compiler: Compiler): void;
}
interface SingTon {
    client: ClientPlugin;
    server: ServerPlugin;
    getEntryPath: (res: any) => string;
}
export default function getSsrInjectPlugin(entryFilePath: string, htmlFilePath: string): SingTon;
export {};
