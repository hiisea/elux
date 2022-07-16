import { env } from '@elux/core';
import { BaseNativeRouter, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory() {
  return {
    url: '',

    push() {
      return;
    },

    replace() {
      return;
    }

  };
}

function createBrowserHistory() {
  return {
    url: '',

    push(url) {
      this.url = url;
      env.history.pushState(null, '', url);
    },

    replace(url) {
      this.url = url;
      env.history.replaceState(null, '', url);
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
      env.addEventListener('popstate', () => {
        if (history.url) {
          env.history.replaceState(null, '', history.url);
          env.setTimeout(() => this.router.back(1, 'page'), 0);
        }
      }, true);
    }
  }

  init(location, key) {
    this.history.push(location.url);
    return false;
  }

  push(location, key) {
    this.history.replace(location.url);
    return false;
  }

  replace(location, key) {
    this.history.replace(location.url);
    return false;
  }

  relaunch(location, key) {
    this.history.replace(location.url);
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
  return browserNativeRouter.router;
}
export function createServerRouter() {
  const history = createServerHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}