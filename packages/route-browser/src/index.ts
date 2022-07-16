import {env, IRouter, Location, UNListener} from '@elux/core';
import {BaseNativeRouter, routeConfig, setRouteConfig} from '@elux/route';

setRouteConfig({NotifyNativeRouter: {window: true, page: true}});

interface IHistory {
  url: string;
  push(url: string): void;
  replace(url: string): void;
}

function createServerHistory(): IHistory {
  return {
    url: '',
    push() {
      return;
    },
    replace() {
      return;
    },
  };
}

function createBrowserHistory(): IHistory {
  return {
    url: '',
    push(url: string) {
      this.url = url;
      env.history!.pushState(null, '', url);
    },
    replace(url: string) {
      this.url = url;
      env.history!.replaceState(null, '', url);
    },
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;

  constructor(private history: IHistory) {
    super();
    const {window, page} = routeConfig.NotifyNativeRouter;
    if (window || page) {
      env.addEventListener(
        'popstate',
        () => {
          if (history.url) {
            env.history!.pushState(null, '', history.url);
            env.setTimeout(() => this.router.back(1, 'page'), 0);
          }
        },
        true
      );
    }
  }

  protected init(location: Location, key: string): boolean {
    this.history.push(location.url);
    return false;
  }
  protected push(location: Location, key: string): boolean {
    this.history.replace(location.url);
    return false;
  }

  protected replace(location: Location, key: string): boolean {
    this.history.replace(location.url);
    return false;
  }

  protected relaunch(location: Location, key: string): boolean {
    this.history.replace(location.url);
    return false;
  }

  protected back(location: Location, key: string, index: [number, number]): boolean {
    this.history.replace(location.url);
    return false;
  }

  public exit(): void {
    env.history!.go(-2);
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createClientRouter(): IRouter {
  const history: IHistory = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}

export function createServerRouter(): IRouter {
  const history: IHistory = createServerHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
