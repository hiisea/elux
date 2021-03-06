import { Action } from './basic';
import { LoadingState } from './utils';
export declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
/**
 * 创建一个特殊的ErrorAction
 *
 * @param error - 错误体
 *
 * @public
 */
export declare function errorAction(error: any): Action;
export declare function getErrorActionType(): string;
export declare function getInitActionType(moduleName: string): string;
//# sourceMappingURL=actions.d.ts.map