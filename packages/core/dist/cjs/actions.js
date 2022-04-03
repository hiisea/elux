"use strict";

exports.__esModule = true;
exports.ActionTypes = void 0;
exports.errorAction = errorAction;
exports.errorProcessed = void 0;
exports.isProcessedError = isProcessedError;
exports.moduleInitAction = moduleInitAction;
exports.moduleLoadingAction = moduleLoadingAction;
exports.setProcessedError = setProcessedError;

var _basic = require("./basic");

var errorProcessed = '__eluxProcessed__';
exports.errorProcessed = errorProcessed;

function isProcessedError(error) {
  return error && !!error[errorProcessed];
}

function setProcessedError(error, processed) {
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

var ActionTypes = {
  Init: 'initState',
  Loading: 'loadingState',
  Error: "error"
};
exports.ActionTypes = ActionTypes;

function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + ActionTypes.Loading,
    payload: [loadingState]
  };
}

function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + ActionTypes.Init,
    payload: [initState]
  };
}

function errorAction(error) {
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
    type: "" + _basic.coreConfig.AppModuleName + _basic.coreConfig.NSP + ActionTypes.Error,
    payload: [actionError]
  };
}