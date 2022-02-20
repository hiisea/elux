"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.BaseModel = void 0;
exports.exportModule = exportModule;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _basic = require("./basic");

var _actions = require("./actions");

var _modules = require("./modules");

var _inject = require("./inject");

function exportModule(moduleName, ModelClass, components, data) {
  return (0, _modules.baseExportModule)(moduleName, ModelClass, components, data);
}

var BaseModel = (0, _decorate2.default)(null, function (_initialize) {
  var BaseModel = function BaseModel(moduleName, store) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
  };

  return {
    F: BaseModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",
      value: void 0
    }, {
      kind: "method",
      key: "getLatestState",
      value: function getLatestState() {
        return this.store.router.latestState;
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getUncommittedState",
      value: function getUncommittedState() {
        return this.store.getUncommittedState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return _basic.MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return _basic.MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "router",
      value: function router() {
        return this.store.router;
      }
    }, {
      kind: "method",
      key: "getRouteParams",
      value: function getRouteParams() {
        return this.store.getRouteParams(this.moduleName);
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return (0, _inject.loadModel)(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MInit,
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MLoading,
      value: function value(payload) {
        var state = this.getState();
        var loading = (0, _basic.mergeState)(state.loading, payload);
        return (0, _basic.mergeState)(state, {
          loading: loading
        });
      }
    }, {
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }]
  };
});
exports.BaseModel = BaseModel;