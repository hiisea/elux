import {Action, ActionError, coreConfig} from './basic';
import {LoadingState} from './utils';

export const errorProcessed = '__eluxProcessed__';

export function isProcessedError(error: any): boolean {
  return error && !!error[errorProcessed];
}

export function setProcessedError(error: any, processed: boolean): {[errorProcessed]: boolean; [key: string]: any} {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  Object.defineProperty(error, errorProcessed, {value: processed, enumerable: false, writable: true});
  return error;
}

export function moduleLoadingAction(moduleName: string, loadingState: {[group: string]: LoadingState}): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}_loadingState`,
    payload: [loadingState],
  };
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
    type: getErrorActionType(),
    payload: [actionError],
  };
}

export function getErrorActionType(): string {
  return coreConfig.StageModuleName + coreConfig.NSP + '_error';
}

export function getInitActionType(moduleName: string): string {
  return moduleName + coreConfig.NSP + '_initState';
}
