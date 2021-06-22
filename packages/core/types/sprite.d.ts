export declare enum LoadingState {
    Start = "Start",
    Stop = "Stop",
    Depth = "Depth"
}
export declare class SingleDispatcher<T> {
    protected listenerId: number;
    protected readonly listenerMap: Record<string, (data: T) => void>;
    addListener(callback: (data: T) => void): () => void;
    dispatch(data: T): void;
}
export declare class MultipleDispatcher<T extends Record<string, any> = {}> {
    protected listenerId: number;
    protected listenerMap: {
        [N in keyof T]?: {
            [id: string]: (data: T[N]) => void;
        };
    };
    addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void): () => void;
    dispatch<N extends keyof T>(name: N, data: T[N]): void;
}
export declare class TaskCounter extends SingleDispatcher<LoadingState> {
    deferSecond: number;
    readonly list: {
        promise: Promise<any>;
        note: string;
    }[];
    private ctimer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private completeItem;
}
export declare function isPlainObject(obj: any): boolean;
export declare function deepMerge(target: {
    [key: string]: any;
}, ...args: any[]): any;
export declare function warn(str: string): void;
export declare function isPromise(data: any): data is Promise<any>;
export declare function isServer(): boolean;
export declare function serverSide<T>(callback: () => T): T | undefined;
export declare function clientSide<T>(callback: () => T): T | undefined;
export declare function delayPromise(second: number): (target: any, key: string, descriptor: PropertyDescriptor) => void;
