import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { BaseNativeRouter, coreConfig, env, setCoreConfig } from '@elux/core';
setCoreConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory() {
  return {
    url: '',
    push: function push() {
      return;
    },
    replace: function replace() {
      return;
    }
  };
}

function createBrowserHistory() {
  return {
    url: '',
    push: function push(url) {
      this.url = url;
      env.history.pushState(null, '', url);
    },
    replace: function replace(url) {
      this.url = url;
      env.history.replaceState(null, '', url);
    }
  };
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _coreConfig$NotifyNat = coreConfig.NotifyNativeRouter,
        window = _coreConfig$NotifyNat.window,
        page = _coreConfig$NotifyNat.page;

    if ((window || page) && !env.isServer) {
      env.addEventListener('popstate', function () {
        if (history.url) {
          env.history.pushState(null, '', history.url);
          env.setTimeout(function () {
            return _this.router.back(1, 'page');
          }, 0);
        }
      }, true);
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.init = function init(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.push = function push(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.back = function back(location, key, index) {
    this.history.replace(location.url);
    return false;
  };

  _proto.exit = function exit() {
    if (!env.isServer) {
      env.history.go(-2);
    }
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);

export function createClientRouter() {
  var history = createBrowserHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
export function createServerRouter() {
  var history = createServerHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}