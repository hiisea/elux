import { LoadingState } from './utils';
import { Action, ModuleState } from './basic';
export declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare const ActionTypes: {
    Init: string;
    Loading: string;
    Error: string;
};
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
export declare function moduleInitAction(moduleName: string, initState: ModuleState): Action;
export declare function errorAction(error: any): Action;
//# sourceMappingURL=actions.d.ts.map