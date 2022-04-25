import {createBrowserHistory} from 'history';

import {env, IRouter, Location, NativeRequest, UNListener} from '@elux/core';
import {BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig} from '@elux/route';

setRouteConfig({NotifyNativeRouter: {window: true, page: true}});

interface IHistory {
  push(location: Location): void;
  replace(location: Location): void;
  block(callback: (locationData: unknown, action: 'PUSH' | 'POP' | 'REPLACE') => string | false | void): UNListener;
  location: {pathname: string; search: string; hash: string};
}

function createServerHistory(nativeRequest: NativeRequest): IHistory {
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
    location: {pathname, search, hash},
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;

  constructor(private history: IHistory, nativeRequest: NativeRequest) {
    super(nativeRequest);
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
    this.history.push(location);
    return false;
  }

  protected replace(location: Location, key: string): boolean {
    this.history.push(location);
    return false;
  }

  protected relaunch(location: Location, key: string): boolean {
    this.history.push(location);
    return false;
  }

  protected back(location: Location, key: string, index: [number, number]): boolean {
    this.history.replace(location);
    return false;
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createClientRouter(): IRouter {
  const history: IHistory = createBrowserHistory();
  const nativeRequest: NativeRequest = {
    request: {url: locationToUrl(history.location)},
    response: {},
  };
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}

export function createServerRouter(nativeRequest: NativeRequest): IRouter {
  const history: IHistory = createServerHistory(nativeRequest);
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}
