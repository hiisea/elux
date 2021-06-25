import { EluxLocation, DeepPartial, PartialLocation, RouteState, Location, RootParams } from './basic';
export declare function getDefaultParams(): Record<string, any>;
export interface NativeLocation {
    pathname: string;
    searchData?: Record<string, string>;
    hashData?: Record<string, string>;
}
export declare type LocationTransform = {
    urlToEluxLocation: (url: string) => EluxLocation;
    nativeUrlToEluxLocation: (nativeUrl: string) => EluxLocation;
    nativeLocationToEluxLocation: (nativeLocation: NativeLocation) => EluxLocation;
    eluxLocationtoPartialLocation: (eluxLocation: EluxLocation) => PartialLocation;
    partialLocationToLocation: <P extends RootParams>(partialLocation: PartialLocation) => Location<P> | Promise<Location<P>>;
    eluxLocationtoLocation: <P extends RootParams>(eluxLocation: EluxLocation) => Location<P> | Promise<Location<P>>;
    locationToMinData: (location: Location) => {
        pathname: string;
        params: Record<string, any>;
        pathParams: Record<string, any>;
    };
    locationtoNativeLocation: (location: Location) => NativeLocation;
};
export declare type PagenameMap<P> = Record<string, {
    argsToParams(pathArgs: Array<string | undefined>): DeepPartial<P>;
    paramsToArgs(params: DeepPartial<P>): Array<any>;
}>;
export declare type NativeLocationMap = {
    in(nativeLocation: NativeLocation): NativeLocation;
    out(nativeLocation: NativeLocation): NativeLocation;
};
export declare function assignDefaultData(data: {
    [moduleName: string]: any;
}): {
    [moduleName: string]: any;
};
export declare function nativeUrlToNativeLocation(url: string): NativeLocation;
export declare function eluxUrlToEluxLocation(url: string): EluxLocation;
export declare function nativeLocationToNativeUrl({ pathname, searchData, hashData }: NativeLocation): string;
export declare function eluxLocationToEluxUrl(location: EluxLocation): string;
export declare function payloadToEluxLocation(payload: {
    pathname?: string;
    params?: Record<string, any>;
    extendParams?: Record<string, any> | 'current';
}, curRouteState: RouteState): EluxLocation;
export declare function createLocationTransform(pagenameMap: PagenameMap<any>, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): LocationTransform;
