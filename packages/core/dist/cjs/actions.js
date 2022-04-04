"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.errorProcessed = void 0;
exports.getErrorActionType = getErrorActionType;
exports.getInitActionType = getInitActionType;
exports.isProcessedError = isProcessedError;
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

function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + "_loadingState",
    payload: [loadingState]
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
    type: getErrorActionType(),
    payload: [actionError]
  };
}

function getErrorActionType() {
  return _basic.coreConfig.StageModuleName + _basic.coreConfig.NSP + '_error';
}

function getInitActionType(moduleName) {
  return moduleName + _basic.coreConfig.NSP + '_initState';
}