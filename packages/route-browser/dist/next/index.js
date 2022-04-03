import { Router, BaseNativeRouter, setRouteConfig, routeConfig } from '@elux/route';
import { env } from '@elux/core';
import { createBrowserHistory } from 'history';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(url) {
  const [pathname, search = ''] = url.split('?');
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
      search,
      hash: ''
    }
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  constructor(history, nativeData) {
    super(history.location, nativeData);
    this.unlistenHistory = void 0;
    this.router = void 0;
    this.history = history;
    this.router = new Router(this);
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = this.history.block((locationData, action) => {
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 100);
          return false;
        }

        return undefined;
      });
    }
  }

  push(location, key) {
    if (!env.isServer) {
      this.history.push(location);
    }

    return false;
  }

  replace(location, key) {
    if (!env.isServer) {
      this.history.push(location);
    }

    return false;
  }

  relaunch(location, key) {
    if (!env.isServer) {
      this.history.push(location);
    }

    return false;
  }

  back(location, key, index) {
    if (!env.isServer) {
      this.history.replace(location);
    }

    return false;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}

export function createClientRouter() {
  const history = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history, {});
  return browserNativeRouter.router;
}
export function createServerRouter(url, nativeData) {
  const history = createServerHistory(url);
  const browserNativeRouter = new BrowserNativeRouter(history, nativeData);
  return browserNativeRouter.router;
}