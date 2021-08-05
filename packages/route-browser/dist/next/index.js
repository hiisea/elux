import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter, setRouteConfig, routeConfig } from '@elux/route';
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

    _defineProperty(this, "serverSide", false);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      this.serverSide = true;
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
      const {
        pathname = '',
        search = '',
        hash = ''
      } = location;
      const url = [pathname, search, hash].join('');
      const key = this.getKey(location);
      const changed = this.onChange(key);

      if (changed) {
        let index = 0;
        let callback;

        if (action === 'POP') {
          index = this.router.getHistory().findIndex(key);
        }

        if (index > 0) {
          callback = () => this.router.back(index, routeConfig.notifyNativeRouter.root);
        } else if (action === 'REPLACE') {
          callback = () => this.router.replace(url, routeConfig.notifyNativeRouter.root);
        } else if (action === 'PUSH') {
          callback = () => this.router.push(url, routeConfig.notifyNativeRouter.root);
        } else {
          callback = () => this.router.relaunch(url, routeConfig.notifyNativeRouter.root);
        }

        callback && env.setTimeout(callback, 50);
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
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  replace(getNativeData, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  relaunch(getNativeData, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  back(getNativeData, n, key) {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.go(-n);
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