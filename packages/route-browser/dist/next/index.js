import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig, routeConfig, urlParser } from '@elux/route';
import { env } from '@elux/core';
import { createBrowserHistory as _createBrowserHistory } from 'history';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});
export function createServerHistory(url) {
  const [pathname, search] = url.split('?');
  return {
    push() {
      return undefined;
    },

    replace() {
      return undefined;
    },

    block() {
      return () => undefined;
    },

    location: {
      pathname,
      search
    }
  };
}
export function createBrowserHistory() {
  return _createBrowserHistory();
}
export class BrowserNativeRouter extends BaseNativeRouter {
  constructor(_history) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this._history = _history;
    const {
      root,
      internal
    } = routeConfig.notifyNativeRouter;

    if (root || internal) {
      this._unlistenHistory = this._history.block((locationData, action) => {
        if (action === 'POP') {
          env.setTimeout(() => this.eluxRouter.back(1), 100);
          return false;
        }

        return undefined;
      });
    }
  }

  push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));

      return true;
    }

    return undefined;
  }

  replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));

      return true;
    }

    return undefined;
  }

  relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));

      return true;
    }

    return undefined;
  }

  back(location, index, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));

      return true;
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory && this._unlistenHistory();
  }

}
export class EluxRouter extends BaseEluxRouter {
  constructor(nativeUrl, browserNativeRouter, nativeData) {
    super(nativeUrl, browserNativeRouter, nativeData);
  }

}
export function createRouter(browserHistory, nativeData) {
  const browserNativeRouter = new BrowserNativeRouter(browserHistory);
  const {
    pathname,
    search
  } = browserHistory.location;
  const router = new EluxRouter(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
  return router;
}