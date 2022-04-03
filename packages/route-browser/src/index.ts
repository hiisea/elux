import {Router, BaseNativeRouter, setRouteConfig, routeConfig} from '@elux/route';
import {env, Location, UNListener} from '@elux/core';
import {createBrowserHistory} from 'history';

setRouteConfig({NotifyNativeRouter: {window: true, page: true}});

interface IHistory {
  push(location: Location): void;
  replace(location: Location): void;
  block(callback: (locationData: unknown, action: 'PUSH' | 'POP' | 'REPLACE') => string | false | void): UNListener;
  location: {pathname: string; search: string; hash: string};
}

function createServerHistory(url: string): IHistory {
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
    location: {pathname, search, hash: ''},
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;
  public router: Router;

  constructor(private history: IHistory, nativeData: any) {
    super(history.location, nativeData);
    this.router = new Router(this);
    const {window, page} = routeConfig.NotifyNativeRouter;
    if (window || page) {
      this.unlistenHistory = this.history.block((locationData, action) => {
        // browser与elux简化为松散关系，操作elux一定不会触发POP，触发POP一定是操作browser
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 100);
          return false;
        }
        return undefined;
      });
    }
  }

  protected push(location: Location, key: string): boolean {
    if (!env.isServer) {
      this.history.push(location);
    }
    return false;
  }

  protected replace(location: Location, key: string): boolean {
    if (!env.isServer) {
      this.history.push(location);
    }
    return false;
  }

  protected relaunch(location: Location, key: string): boolean {
    if (!env.isServer) {
      this.history.push(location);
    }
    return false;
  }

  protected back(location: Location, key: string, index: [number, number]): boolean {
    if (!env.isServer) {
      this.history.replace(location);
    }
    return false;
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createClientRouter(): Router {
  const history: IHistory = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history, {});
  return browserNativeRouter.router;
}
export function createServerRouter(url: string, nativeData: any): Router {
  const history: IHistory = createServerHistory(url);
  const browserNativeRouter = new BrowserNativeRouter(history, nativeData);
  return browserNativeRouter.router;
}
