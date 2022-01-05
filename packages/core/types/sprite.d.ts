/**
 * @internal
 */
export declare enum LoadingState {
    /**
     * 开始加载.
     */
    Start = "Start",
    /**
     * 加载完成.
     */
    Stop = "Stop",
    /**
     * 开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态
     */
    Depth = "Depth"
}
/**
 * @internal
 */
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
            [id: string]: (data: T[N]) => void | Promise<void>;
        };
    };
    addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void | Promise<void>): () => void;
    dispatch<N extends keyof T>(name: N, data: T[N]): void | Promise<void[]>;
}
/**
 * @internal
 */
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
/**
 * @internal
 */
export declare function deepClone<T>(data: T): T;
/**
 * @internal
 */
export declare function deepMerge(target: {
    [key: string]: any;
}, ...args: any[]): any;
export declare function warn(str: string): void;
export declare function isPromise(data: any): data is Promise<any>;
/**
 * @internal
 */
export declare function isServer(): boolean;
/**
 * @internal
 */
export declare function serverSide<T>(callback: () => T): any;
/**
 * @internal
 */
export declare function clientSide<T>(callback: () => T): any;
export declare function delayPromise(second: number): (target: any, key: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=sprite.d.ts.map