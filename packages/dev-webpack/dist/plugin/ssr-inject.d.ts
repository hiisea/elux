import { Compiler } from 'webpack';
interface Options {
    entryFileName: string;
}
export declare class SsrInject {
    entryFileName: string;
    entryFilePath: string;
    htmlKey: string;
    html: string;
    outputFileSystem: any;
    constructor(options: Options);
    apply(compiler: Compiler): void;
    getEntryPath(res: any): string;
}
export declare function getSsrInjectPlugin(entryFileName?: string): SsrInject;
export {};
