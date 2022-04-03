import {LoadingState} from './utils';
import {Action, coreConfig, ModuleState, ActionError} from './basic';

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

export const ActionTypes = {
  Init: 'initState',
  Loading: 'loadingState',
  Error: `error`,
};

export function moduleLoadingAction(moduleName: string, loadingState: {[group: string]: LoadingState}): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.Loading}`,
    payload: [loadingState],
  };
}

export function moduleInitAction(moduleName: string, initState: ModuleState): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.Init}`,
    payload: [initState],
  };
}

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
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}${ActionTypes.Error}`,
    payload: [actionError],
  };
}
