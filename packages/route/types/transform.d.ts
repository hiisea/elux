import { EluxLocation, PartialLocationState, LocationState, RootParams, NativeLocation } from './basic';
export interface LocationTransform {
    eluxLocationToPartialLocationState(eluxLocation: EluxLocation): PartialLocationState;
    partialLocationStateToEluxLocation(partialLocationState: PartialLocationState): EluxLocation;
    nativeLocationToPartialLocationState(nativeLocation: NativeLocation): PartialLocationState;
    partialLocationStateToNativeLocation(partialLocationState: PartialLocationState): NativeLocation;
    eluxLocationToNativeLocation(eluxLocation: EluxLocation): NativeLocation;
    nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation;
    eluxUrlToEluxLocation(eluxUrl: string): EluxLocation;
    eluxLocationToEluxUrl(location: EluxLocation): string;
    nativeUrlToNativeLocation(nativeUrl: string): NativeLocation;
    nativeLocationToNativeUrl(location: NativeLocation): string;
    eluxUrlToNativeUrl(eluxUrl: string): string;
    nativeUrlToEluxUrl(nativeUrl: string): string;
    partialLocationStateToLocationState<P extends RootParams>(partialLocationState: PartialLocationState): LocationState<P> | Promise<LocationState<P>>;
    partialLocationStateToMinData(partialLocationState: PartialLocationState): {
        pathname: string;
        params: Record<string, any>;
        pathParams: Record<string, any>;
    };
    payloadToPartialLocationState(payload: {
        params?: Record<string, any>;
        extendParams?: Record<string, any>;
        pagename?: string;
        pathname?: string;
    }): PartialLocationState;
}
export interface PagenameMap {
    [pageName: string]: {
        argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
        paramsToArgs: Function;
        page?: any;
    };
}
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
export declare function createLocationTransform(pagenameMap: PagenameMap, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): LocationTransform;
