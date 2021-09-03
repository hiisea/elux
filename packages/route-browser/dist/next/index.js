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
  constructor(url) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_history", void 0);

    if (env.isServer) {
      this._history = createServerHistory();
    } else {
      this._history = createBrowserHistory();
    }

    this._unlistenHistory = this._history.block((location, action) => {
      if (action === 'POP') {
        env.setTimeout(() => this.eluxRouter.back(1), 100);
        return false;
      }

      const key = this.getKey(location);
      const changed = this.onChange(key);

      if (changed) {
        const {
          pathname = '',
          search = '',
          hash = ''
        } = location;
        const url = [pathname, search, hash].join('');
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

  getKey(location) {
    return location.state || '';
  }

  push(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  }

  replace(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  }

  relaunch(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  }

  back(getNativeData, n, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();

      this._history.replace(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }

}
export class EluxRouter extends BaseEluxRouter {
  constructor(url, browserNativeRouter, locationTransform, nativeData) {
    super(url, browserNativeRouter, locationTransform, nativeData);
  }

}
export function createRouter(url, locationTransform, nativeData) {
  const browserNativeRouter = new BrowserNativeRouter(url);
  const router = new EluxRouter(url, browserNativeRouter, locationTransform, nativeData);
  return router;
}