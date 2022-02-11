import {BaseEluxRouter, BaseNativeRouter, ULocationTransform, setRouteConfig, routeConfig, urlParser} from '@elux/route';
import {env, UNListener} from '@elux/core';
import {createBrowserHistory as _createBrowserHistory} from 'history';

setRouteConfig({notifyNativeRouter: {root: true, internal: true}});

export type Action = 'PUSH' | 'POP' | 'REPLACE';
export type LocationData = {pathname: string; search: string; hash: string; state?: string};
export interface IHistory {
  push(url: string): void;
  replace(url: string): void;
  block(callback: (locationData: LocationData, action: Action) => string | false | void): UNListener;
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
  private _unlistenHistory: UNListener | undefined;

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

  protected push(location: ULocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected replace(location: ULocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected relaunch(location: ULocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }
    return undefined;
  }

  protected back(location: ULocationTransform, index: [number, number], key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }
    return undefined;
  }

  public destroy(): void {
    this._unlistenHistory && this._unlistenHistory();
  }
}

export function createRouter(browserHistory: IHistory, nativeData: unknown): BaseEluxRouter {
  const browserNativeRouter = new BrowserNativeRouter(browserHistory);
  const {pathname, search} = browserHistory.location;
  return new BaseEluxRouter(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
}
