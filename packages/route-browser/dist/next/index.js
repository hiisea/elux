import { Router, BaseNativeRouter, setRouteConfig, routeConfig, locationToUrl } from '@elux/route';
import { env } from '@elux/core';
import { createBrowserHistory } from 'history';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(nativeRequest) {
  const [pathname, search = '', hash = ''] = nativeRequest.request.url.split(/[?#]/);
  return {
    push() {
      return;
    },

    replace() {
      return;
    },

    block() {
      return () => undefined;
    },

    location: {
      pathname,
      search,
      hash
    }
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  constructor(history, nativeRequest) {
    super(nativeRequest);
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
    this.history.push(location);
    return false;
  }

  replace(location, key) {
    this.history.push(location);
    return false;
  }

  relaunch(location, key) {
    this.history.push(location);
    return false;
  }

  back(location, key, index) {
    this.history.replace(location);
    return false;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}

export function createClientRouter() {
  const history = createBrowserHistory();
  const nativeRequest = {
    request: {
      url: locationToUrl(history.location)
    },
    response: {}
  };
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}
export function createServerRouter(nativeRequest) {
  const history = createServerHistory(nativeRequest);
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}