import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter, setRouteConfig } from '@elux/route';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@elux/core';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});
export function setBrowserRouteConfig({
  enableMultiPage
}) {
  if (enableMultiPage) {
    setRouteConfig({
      notifyNativeRouter: {
        root: true,
        internal: false
      }
    });
  } else {
    setRouteConfig({
      notifyNativeRouter: {
        root: false,
        internal: true
      }
    });
  }
}
export class BrowserNativeRouter extends BaseNativeRouter {
  constructor(createHistory) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "history", void 0);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      const [pathname, search = ''] = createHistory.split('?');
      this.history = {
        action: 'PUSH',
        length: 0,

        listen() {
          return () => undefined;
        },

        createHref() {
          return '';
        },

        push() {
          return undefined;
        },

        replace() {
          return undefined;
        },

        go() {
          return undefined;
        },

        goBack() {
          return undefined;
        },

        goForward() {
          return undefined;
        },

        block() {
          return () => undefined;
        },

        location: {
          pathname,
          search: search && `?${search}`,
          hash: ''
        }
      };
    }

    this._unlistenHistory = this.history.block((location, action) => {
      const key = this.getKey(location);
      const changed = this.onChange(key);

      if (changed) {
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 100);
        }

        return false;
      }

      return undefined;
    });
  }

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
  }

  getKey(location) {
    return location.state || '';
  }

  passive(url, key, action) {
    return true;
  }

  refresh() {
    this.history.go(0);
  }

  push(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  replace(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  relaunch(getNativeData, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  back(getNativeData, n, key) {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  toOutside(url) {
    this.history.push(url);
  }

  destroy() {
    this._unlistenHistory();
  }

}
export class Router extends BaseRouter {
  constructor(browserNativeRouter, locationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);
  }

}
export function createRouter(createHistory, locationTransform) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router(browserNativeRouter, locationTransform);
  return router;
}