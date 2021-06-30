import { EluxLocation, DeepPartial, PartialLocation, Location, RootParams, NativeLocation } from './basic';
export interface LocationTransform {
    eluxLocationToPartialLocation(eluxLocation: EluxLocation): PartialLocation;
    eluxLocationToLocation<P extends RootParams>(eluxLocation: EluxLocation): Promise<Location<P>>;
    eluxLocationToNativeLocation(eluxLocation: EluxLocation): NativeLocation;
    partialLocationToEluxLocation(partialLocation: PartialLocation): EluxLocation;
    partialLocationToNativeLocation(partialLocation: PartialLocation): NativeLocation;
    nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation;
    nativeLocationToPartialLocation(nativeLocation: NativeLocation): PartialLocation;
    nativeLocationToLocation<P extends RootParams>(nativeLocation: NativeLocation): Promise<Location<P>>;
    urlToEluxLocation(url: string): EluxLocation;
    urlToToPartialLocation(url: string): PartialLocation;
    urlToLocation<P extends RootParams>(url: string): Promise<Location<P>>;
    urlToGivenLocation(url: string): NativeLocation | EluxLocation;
    partialLocationToLocation<P extends RootParams>(partialLocation: PartialLocation): Promise<Location<P>>;
    partialLocationToMinData(partialLocation: PartialLocation): {
        pathname: string;
        params: Record<string, any>;
        pathParams: Record<string, any>;
    };
}
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
export declare function createLocationTransform(pagenameMap: PagenameMap<any>, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): LocationTransform;
