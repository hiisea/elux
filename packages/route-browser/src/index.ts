import {createBrowserHistory} from 'history';

import {env, IRouter, Location, UNListener} from '@elux/core';
import {BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig} from '@elux/route';

setRouteConfig({NotifyNativeRouter: {window: true, page: true}});

interface IHistory {
  push(url: string): void;
  replace(url: string): void;
  block(callback: (locationData: unknown, action: 'PUSH' | 'POP' | 'REPLACE') => string | false | void): UNListener;
  location: {pathname: string; search: string; hash: string};
}

function createServerHistory(url: string): IHistory {
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
    location: {pathname, search, hash},
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;

  constructor(private history: IHistory) {
    super();
    const {window, page} = routeConfig.NotifyNativeRouter;
    if (window || page) {
      this.unlistenHistory = history.block((locationData, action) => {
        // browser与elux简化为松散关系，操作elux一定不会触发POP，触发POP一定是操作browser
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 0);
          return false;
        }
        return undefined;
      });
    }
  }

  protected init(location: Location, key: string): boolean {
    return false;
  }
  protected push(location: Location, key: string): boolean {
    this.history.push(location.url);
    return false;
  }

  protected replace(location: Location, key: string): boolean {
    this.history.push(location.url);
    return false;
  }

  protected relaunch(location: Location, key: string): boolean {
    this.history.push(location.url);
    return false;
  }

  protected back(location: Location, key: string, index: [number, number]): boolean {
    this.history.replace(location.url);
    return false;
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createClientRouter(): {router: IRouter; url: string} {
  const history: IHistory = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return {router: browserNativeRouter.router, url: locationToUrl(history.location)};
}

export function createServerRouter(url: string): IRouter {
  const history: IHistory = createServerHistory(url);
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
