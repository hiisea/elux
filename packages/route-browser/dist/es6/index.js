import { env } from '@elux/core';
import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
import { createBrowserHistory } from 'history';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(url) {
  const [pathname, search = '', hash = ''] = url.split(/[?#]/);
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
  constructor(history) {
    super();
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.block((locationData, action) => {
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 0);
          return false;
        }

        return undefined;
      });
    }
  }

  init(location, key) {
    return false;
  }

  push(location, key) {
    this.history.push(location.url);
    return false;
  }

  replace(location, key) {
    this.history.push(location.url);
    return false;
  }

  relaunch(location, key) {
    this.history.push(location.url);
    return false;
  }

  back(location, key, index) {
    this.history.replace(location.url);
    return false;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}

export function createClientRouter() {
  const history = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return {
    router: browserNativeRouter.router,
    url: locationToUrl(history.location)
  };
}
export function createServerRouter(url) {
  const history = createServerHistory(url);
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}