"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.defineModuleGetter = defineModuleGetter;
exports.renderApp = renderApp;
exports.ssrApp = ssrApp;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

var defFun = function defFun() {
  return undefined;
};

function defineModuleGetter(moduleGetter, appModuleName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.moduleGetter = moduleGetter;

  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw appModuleName + " could not be found in moduleGetter";
  }
}

function renderApp(_x, _x2, _x3, _x4, _x5) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(baseStore, preloadModules, preloadComponents, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, modules, appModule, AppView;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = _basic.MetaData.moduleGetter, appModuleName = _basic.MetaData.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = (0, _store.enhanceStore)(baseStore, middlewares);
            _basic.MetaData.clientStore = store;
            _context.next = 8;
            return (0, _inject.getModuleList)(preloadModules);

          case 8:
            modules = _context.sent;
            _context.next = 11;
            return (0, _inject.getComponentList)(preloadComponents);

          case 11:
            appModule = modules[0].default;
            _context.next = 14;
            return appModule.model(store);

          case 14:
            AppView = (0, _inject.getComponet)(appModuleName, appViewName);
            return _context.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

function ssrApp(_x6, _x7, _x8, _x9) {
  return _ssrApp.apply(this, arguments);
}

function _ssrApp() {
  _ssrApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(baseStore, preloadModules, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, _yield$getModuleList, appModule, otherModules, AppView;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = _basic.MetaData.moduleGetter, appModuleName = _basic.MetaData.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = (0, _store.enhanceStore)(baseStore, middlewares);
            _context2.next = 7;
            return (0, _inject.getModuleList)(preloadModules);

          case 7:
            _yield$getModuleList = _context2.sent;
            appModule = _yield$getModuleList[0].default;
            otherModules = _yield$getModuleList.slice(1);
            _context2.next = 12;
            return appModule.model(store);

          case 12:
            _context2.next = 14;
            return Promise.all(otherModules.map(function (module) {
              return module.default.model(store);
            }));

          case 14:
            store.dispatch = defFun;
            AppView = (0, _inject.getComponet)(appModuleName, appViewName);
            return _context2.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ssrApp.apply(this, arguments);
}