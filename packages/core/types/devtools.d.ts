/**
 * 派发Action的日志信息
 *
 * @public
 */
export declare type StoreLoggerInfo = {
    id: number;
    isActive: boolean;
    actionName: string;
    payload: any[];
    priority: string[];
    handers: string[];
    state: any;
    effect: boolean;
};
/**
 * Store的日志记录器
 *
 * @remarks
 * Store派发Action都会调用该回调方法
 *
 * @public
 */
export declare type StoreLogger = (info: StoreLoggerInfo) => void;
export declare const devLogger: StoreLogger;
//# sourceMappingURL=devTools.d.ts.map