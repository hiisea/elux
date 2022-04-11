import { coreConfig } from './basic';
export const errorProcessed = '__eluxProcessed__';
export function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
export function setProcessedError(error, processed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return error;
}
export function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: `${moduleName}${coreConfig.NSP}_loadingState`,
    payload: [loadingState]
  };
}
export function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  const processed = !!error[errorProcessed];
  const {
    code = '',
    message = 'unkown error',
    detail
  } = error;
  const actionError = {
    code,
    message,
    detail
  };
  Object.defineProperty(actionError, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return {
    type: getErrorActionType(),
    payload: [actionError]
  };
}
export function getErrorActionType() {
  return coreConfig.StageModuleName + coreConfig.NSP + '_error';
}
export function getInitActionType(moduleName) {
  return moduleName + coreConfig.NSP + '_initState';
}