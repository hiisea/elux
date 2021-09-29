import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig } from '@elux/route';
import { createBrowserHistory } from 'history';
import { env } from '@elux/core';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});

function createServerHistory() {
  return {
    push() {
      return undefined;
    },

    replace() {
      return undefined;
    },

    go() {
      return undefined;
    },

    block() {
      return () => undefined;
    }

  };
}

export class BrowserNativeRouter extends BaseNativeRouter {
  constructor() {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_history", void 0);

    if (env.isServer) {
      this._history = createServerHistory();
    } else {
      this._history = createBrowserHistory();
    }

    this._unlistenHistory = this._history.block((locationData, action) => {
      if (action === 'POP') {
        env.setTimeout(() => this.eluxRouter.back(1), 100);
        return false;
      }

      const key = this.getKey(locationData);
      const changed = this.onChange(key);

      if (changed) {
        const {
          pathname = '',
          search = ''
        } = locationData;
        const url = ['n:/', pathname, search].join('');
        let callback;

        if (action === 'REPLACE') {
          callback = () => this.eluxRouter.replace(url);
        } else if (action === 'PUSH') {
          callback = () => this.eluxRouter.push(url);
        } else {
          callback = () => this.eluxRouter.relaunch(url);
        }

        env.setTimeout(callback, 100);
        return false;
      }

      return undefined;
    });
  }

  getKey(locationData) {
    return locationData.state || '';
  }

  push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  }

  replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  }

  relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  }

  back(location, n, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }

}
export class EluxRouter extends BaseEluxRouter {
  constructor(nativeUrl, browserNativeRouter, nativeData) {
    super(nativeUrl, browserNativeRouter, nativeData);
  }

}
export function createRouter(nativeUrl, nativeData) {
  const browserNativeRouter = new BrowserNativeRouter();
  const router = new EluxRouter(nativeUrl, browserNativeRouter, nativeData);
  return router;
}