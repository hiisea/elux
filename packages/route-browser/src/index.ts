import {BaseEluxRouter, BaseNativeRouter, RootParams, ILocationTransform, setRouteConfig, routeConfig, urlParser} from '@elux/route';
import {env} from '@elux/core';
import {createBrowserHistory as _createBrowserHistory} from 'history';

setRouteConfig({notifyNativeRouter: {root: true, internal: true}});

type UnregisterCallback = () => void;
export type Action = 'PUSH' | 'POP' | 'REPLACE';
export type LocationData = {pathname: string; search: string; hash: string; state?: string};
export interface IHistory {
  push(url: string): void;
  replace(url: string): void;
  block(callback: (locationData: LocationData, action: Action) => string | false | void): UnregisterCallback;
  location: {pathname: string; search: string};
}

export function createServerHistory(url: string): IHistory {
  const [pathname, search] = url.split('?');
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
    location: {pathname, search},
  };
}

export function createBrowserHistory(): IHistory {
  return _createBrowserHistory();
}

export class BrowserNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback | undefined;

  constructor(public _history: IHistory) {
    super();
    const {root, internal} = routeConfig.notifyNativeRouter;
    if (root || internal) {
      this._unlistenHistory = this._history.block((locationData, action) => {
        // browser与elux简化为松散关系，操作elux一定不会触发POP，触发POP一定是操作browser
        if (action === 'POP') {
          env.setTimeout(() => this.eluxRouter.back(1), 100);
          return false;
        }
        return undefined;
      });
    }
  }

  protected push(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected replace(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected relaunch(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }
    return undefined;
  }

  public destroy(): void {
    this._unlistenHistory && this._unlistenHistory();
  }
}

export class EluxRouter<P extends RootParams, N extends string, NT = unknown> extends BaseEluxRouter<P, N, NT> {
  public declare nativeRouter: BrowserNativeRouter;

  constructor(nativeUrl: string, browserNativeRouter: BrowserNativeRouter, nativeData: NT) {
    super(nativeUrl, browserNativeRouter, nativeData);
  }
}

export function createRouter<P extends RootParams, N extends string, NT = unknown>(browserHistory: IHistory, nativeData: NT): EluxRouter<P, N, NT> {
  const browserNativeRouter = new BrowserNativeRouter(browserHistory);
  const {pathname, search} = browserHistory.location;
  const router = new EluxRouter<P, N, NT>(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
  return router;
}
