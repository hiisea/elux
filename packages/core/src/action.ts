import type {LoadingState} from './utils';
import type {Action, ActionError, Location, ModuleState, RouteAction} from './basic';

export function getActionData(action: Action): any[] {
  return Array.isArray(action.payload) ? action.payload : [];
}
export function testRouteChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_testRouteChange`,
    payload: [location, routeAction],
  };
}
export function beforeRouteChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction],
  };
}
export function afterRouteChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_afterRouteChange`,
    payload: [location, routeAction],
  };
}
export function initModuleSuccessAction(moduleName: string, initState: ModuleState): Action {
  return {
    type: `${moduleName}${actionConfig.NSP}_initState`,
    payload: [initState],
  };
}
export function initModuleErrorAction(moduleName: string, error: any): Action {
  const initState: ModuleState = {_error: error + ''};
  return {
    type: `${moduleName}${actionConfig.NSP}_initState`,
    payload: [initState],
  };
}

export function isInitAction(action: Action): boolean {
  const [, actionName] = action.type.split(actionConfig.NSP);
  return actionName === '_initState';
}

export function loadingAction(moduleName: string, groupName: string, loadingState: LoadingState): Action {
  return {
    type: `${moduleName}${actionConfig.NSP}_loading`,
    payload: [{[groupName]: loadingState}],
  };
}
export const errorProcessed = '__eluxProcessed__';

export function setProcessedError(error: any, processed: boolean): {[errorProcessed]: boolean; [key: string]: any} {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  Object.defineProperty(error, errorProcessed, {value: processed, enumerable: false, writable: true});
  return error;
}
export function isProcessedError(error: any): boolean {
  return error && !!error[errorProcessed];
}
/**
 * 创建一个特殊的ErrorAction
 *
 * @param error - 错误体
 *
 * @public
 */
export function errorAction(error: any): Action {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  const processed = !!error[errorProcessed];
  const {code = '', message = 'unkown error', detail} = error;
  const actionError: ActionError = {code, message, detail};
  Object.defineProperty(actionError, errorProcessed, {value: processed, enumerable: false, writable: true});
  //env.console.error(error);
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_error`,
    payload: [actionError],
  };
}

export function setProcessedErrorAction(errorAction: Action): Action | undefined {
  const actionData = getActionData(errorAction);
  if (isProcessedError(actionData[0])) {
    return undefined;
  }
  actionData[0] = setProcessedError(actionData[0], true);
  return errorAction;
}
export function isErrorAction(action: Action): boolean {
  return action.type === `${actionConfig.StageModuleName}${actionConfig.NSP}_error`;
}

export const actionConfig: {
  NSP: string;
  StageModuleName: string;
} = {
  NSP: '.',
  StageModuleName: 'stage',
};
