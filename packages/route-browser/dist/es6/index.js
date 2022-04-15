import { createBrowserHistory } from 'history';
import { env } from '@elux/core';
import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
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
    this.history = history;
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.block((locationData, action) => {
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
  }

  replace(location, key) {
    this.history.push(location);
  }

  relaunch(location, key) {
    this.history.push(location);
  }

  back(location, key, index) {
    this.history.replace(location);
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