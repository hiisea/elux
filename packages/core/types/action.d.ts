import type { LoadingState } from './utils';
import type { Action, Location, ModuleState, RouteAction } from './basic';
export declare function getActionData(action: Action): any[];
export declare function testRouteChangeAction(location: Location, routeAction: RouteAction): Action;
export declare function beforeRouteChangeAction(location: Location, routeAction: RouteAction): Action;
export declare function afterRouteChangeAction(location: Location, routeAction: RouteAction): Action;
export declare function initModuleSuccessAction(moduleName: string, initState: ModuleState): Action;
export declare function initModuleErrorAction(moduleName: string, error: any): Action;
export declare function isInitAction(action: Action): boolean;
export declare function loadingAction(moduleName: string, groupName: string, loadingState: LoadingState): Action;
export declare const errorProcessed = "__eluxProcessed__";
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function isProcessedError(error: any): boolean;
/**
 * 创建一个特殊的ErrorAction
 *
 * @param error - 错误体
 *
 * @public
 */
export declare function errorAction(error: any): Action;
export declare function setProcessedErrorAction(errorAction: Action): Action | undefined;
export declare function isErrorAction(action: Action): boolean;
export declare const actionConfig: {
    NSP: string;
    StageModuleName: string;
};
//# sourceMappingURL=action.d.ts.map