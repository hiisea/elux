import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { MetaData } from './basic';
import { getModuleList, getComponentList, getComponet } from './inject';
import { enhanceStore } from './store';

var defFun = function defFun() {
  return undefined;
};

export function defineModuleGetter(moduleGetter, appModuleName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;

  if (!moduleGetter[appModuleName]) {
    throw appModuleName + " could not be found in moduleGetter";
  }
}
export function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(router, baseStore, preloadModules, preloadComponents, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, modules, appModule, AppView;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = MetaData.moduleGetter, appModuleName = MetaData.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = enhanceStore(baseStore, middlewares);
            router.init(store);
            _context.next = 8;
            return getModuleList(preloadModules);

          case 8:
            modules = _context.sent;
            _context.next = 11;
            return getComponentList(preloadComponents);

          case 11:
            appModule = modules[0];
            _context.next = 14;
            return appModule.model(store);

          case 14:
            AppView = getComponet(appModuleName, appViewName);
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

export function initApp(router, baseStore, middlewares) {
  var moduleGetter = MetaData.moduleGetter,
      appModuleName = MetaData.appModuleName;
  var store = enhanceStore(baseStore, middlewares);
  router.init(store);
  var appModule = moduleGetter[appModuleName]();
  appModule.model(store);
  return store;
}
export function ssrApp(_x7, _x8, _x9, _x10, _x11) {
  return _ssrApp.apply(this, arguments);
}

function _ssrApp() {
  _ssrApp = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(router, baseStore, preloadModules, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, _yield$getModuleList, appModule, otherModules, AppView;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = MetaData.moduleGetter, appModuleName = MetaData.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = enhanceStore(baseStore, middlewares);
            router.init(store);
            _context2.next = 8;
            return getModuleList(preloadModules);

          case 8:
            _yield$getModuleList = _context2.sent;
            appModule = _yield$getModuleList[0];
            otherModules = _yield$getModuleList.slice(1);
            _context2.next = 13;
            return appModule.model(store);

          case 13:
            _context2.next = 15;
            return Promise.all(otherModules.map(function (module) {
              return module.model(store);
            }));

          case 15:
            store.dispatch = defFun;
            AppView = getComponet(appModuleName, appViewName);
            return _context2.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ssrApp.apply(this, arguments);
}