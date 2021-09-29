export interface LocationData {
    _eurl?: string;
    _nurl?: string;
    _pagename?: string;
    _payload?: Record<string, any>;
    _params?: Record<string, any>;
}
declare class EluxLocation implements LocationData {
    readonly url: string;
    readonly _eurl?: string;
    readonly _nurl?: string;
    readonly _pagename?: string;
    readonly _payload?: Record<string, any>;
    readonly _params?: Record<string, any>;
    private _pathmatch?;
    private _search?;
    private _pathArgs?;
    private _args?;
    private _minData?;
    constructor(url: string, data: LocationData);
    private update;
    private getPathmatch;
    private getSearch;
    private getArgs;
    private getPathArgs;
    private getPayload;
    private getMinData;
    private toStringArgs;
    getPagename(): string;
    getFastUrl(): string;
    getEluxUrl(): string;
    getNativeUrl(): string;
    getParams(): Record<string, any> | Promise<Record<string, any>>;
}
export declare function createEluxLocation(dataOrUrl: string | {
    pathmatch: string;
    args: Record<string, any>;
} | {
    pagename: string;
    payload: Record<string, any>;
} | {
    pathname: string;
    query: string;
}): EluxLocation;
export {};
