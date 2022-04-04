"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.BaseModel = void 0;
exports.exportModule = exportModule;
exports.getApi = getApi;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _env = _interopRequireDefault(require("./env"));

var _basic = require("./basic");

var _inject = require("./inject");

var _module = require("./module");

var _class;

function exportModule(moduleName, ModelClass, components, data) {
  return (0, _module.exportModuleFacade)(moduleName, ModelClass, components, data);
}

function getApi(demoteForProductionOnly, injectActions) {
  var modules = (0, _inject.getModuleApiMap)(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: function GetActions() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: function GetClientRouter() {
      if (_env.default.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use useRouter() instead';
      }

      return _basic.MetaData.clientRouter;
    },
    LoadComponent: _basic.coreConfig.LoadComponent,
    Modules: modules,
    useRouter: _basic.coreConfig.UseRouter,
    useStore: _basic.coreConfig.UseStore
  };
}

var BaseModel = (_class = function () {
  function BaseModel(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = BaseModel.prototype;

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.getRouter = function getRouter() {
    return this.store.router;
  };

  _proto.getPrevState = function getPrevState() {
    var runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName];
  };

  _proto.getRootState = function getRootState(type) {
    var runtime = this.store.router.runtime;
    var state;

    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }

    return state;
  };

  _proto.getPrivateActions = function getPrivateActions(actionsMap) {
    return _basic.MetaData.moduleApiMap[this.moduleName].actions;
  };

  _proto.getCurrentAction = function getCurrentAction() {
    var store = this.store;
    return store.getCurrentAction();
  };

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto._initState = function _initState(state) {
    return state;
  };

  _proto._updateState = function _updateState(subject, state) {
    return (0, _basic.mergeState)(this.state, state);
  };

  _proto._loadingState = function _loadingState(loadingState) {
    return (0, _basic.mergeState)(this.state, loadingState);
  };

  (0, _createClass2.default)(BaseModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }, {
    key: "actions",
    get: function get() {
      return _basic.MetaData.moduleApiMap[this.moduleName].actions;
    }
  }]);
  return BaseModel;
}(), ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "_initState", [_module.reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "_updateState", [_module.reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "_loadingState", [_module.reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);
exports.BaseModel = BaseModel;