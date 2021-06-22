export declare function isPlainObject(obj: any): boolean;
export declare function extendDefault(target: any, def: any): {
    [key: string]: any;
};
export declare function excludeDefault(data: any, def: any, keepTopLevel: boolean): {
    [key: string]: any;
};
export declare function splitPrivate(data: {
    [key: string]: any;
}, deleteTopLevel: {
    [key: string]: boolean;
}): [{
    [key: string]: any;
} | undefined, {
    [key: string]: any;
} | undefined];
