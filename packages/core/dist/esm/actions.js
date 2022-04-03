import { coreConfig } from './basic';
export var errorProcessed = '__eluxProcessed__';
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
export var ActionTypes = {
  Init: 'initState',
  Loading: 'loadingState',
  Error: "error"
};
export function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + coreConfig.NSP + ActionTypes.Loading,
    payload: [loadingState]
  };
}
export function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + coreConfig.NSP + ActionTypes.Init,
    payload: [initState]
  };
}
export function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  var processed = !!error[errorProcessed];
  var _error = error,
      _error$code = _error.code,
      code = _error$code === void 0 ? '' : _error$code,
      _error$message = _error.message,
      message = _error$message === void 0 ? 'unkown error' : _error$message,
      detail = _error.detail;
  var actionError = {
    code: code,
    message: message,
    detail: detail
  };
  Object.defineProperty(actionError, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return {
    type: "" + coreConfig.AppModuleName + coreConfig.NSP + ActionTypes.Error,
    payload: [actionError]
  };
}