import {BaseEluxRouter, BaseNativeRouter, RootParams, ILocationTransform, setRouteConfig} from '@elux/route';
import {createBrowserHistory} from 'history';
import {env} from '@elux/core';

setRouteConfig({notifyNativeRouter: {root: true, internal: true}});

type UnregisterCallback = () => void;
export type Action = 'PUSH' | 'POP' | 'REPLACE';
export type LocationData = {pathname: string; search: string; hash: string; state?: string};
export interface IHistory {
  push(url: string, key: string): void;
  replace(url: string, key: string): void;
  go(n: number): void;
  block(callback: (locationData: LocationData, action: Action) => string | false | void): UnregisterCallback;
}

function createServerHistory(): IHistory {
  return {
    push() {
      return undefined;
    },
    replace() {
      return undefined;
    },
    go() {
      return undefined;
    },
    block() {
      return () => undefined;
    },
  };
}
export class BrowserNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  private _history: IHistory;

  constructor() {
    super();
    if (env.isServer) {
      this._history = createServerHistory();
    } else {
      this._history = createBrowserHistory();
    }
    //   this._unlistenHistory = this.history.block((location, action) => {
    //     const {pathname = '', search = '', hash = ''} = location;
    //     const url = [pathname, search, hash].join('');
    //     const key = this.getKey(location);
    //     const changed = this.onChange(key);
    //     if (changed) {
    //       let index = 0;
    //       let callback: () => void;
    //       if (action === 'POP') {
    //         index = this.router.getHistory(routeConfig.notifyNativeRouter.root).findIndex(key);
    //       }
    //       if (index > 0) {
    //         callback = () => this.router.back(index, routeConfig.notifyNativeRouter.root);
    //       } else if (action === 'REPLACE') {
    //         callback = () => this.router.replace(url, routeConfig.notifyNativeRouter.root);
    //       } else if (action === 'PUSH') {
    //         callback = () => this.router.push(url, routeConfig.notifyNativeRouter.root);
    //       } else {
    //         callback = () => this.router.relaunch(url, routeConfig.notifyNativeRouter.root);
    //       }
    //       callback && env.setTimeout(callback, 50);
    //       return false;
    //     }
    //     return undefined;
    //   });
    // }
    this._unlistenHistory = this._history.block((locationData, action) => {
      if (action === 'POP') {
        env.setTimeout(() => this.eluxRouter.back(1), 100);
        return false;
      }
      const key = this.getKey(locationData);
      const changed = this.onChange(key);
      if (changed) {
        const {pathname = '', search = ''} = locationData;
        const url = ['n:/', pathname, search].join('');
        let callback: () => void;
        if (action === 'REPLACE') {
          callback = () => this.eluxRouter.replace(url);
        } else if (action === 'PUSH') {
          callback = () => this.eluxRouter.push(url);
        } else {
          callback = () => this.eluxRouter.relaunch(url);
        }
        env.setTimeout(callback, 100);
        return false;
      }
      return undefined;
    });
  }

  private getKey(locationData: LocationData): string {
    return locationData.state || '';
  }

  protected push(location: ILocationTransform, key: string): void | true | Promise<true> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);
      return true;
    }
    return undefined;
  }

  protected replace(location: ILocationTransform, key: string): void | true | Promise<true> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);
      return true;
    }
    return undefined;
  }

  protected relaunch(location: ILocationTransform, key: string): void | true | Promise<true> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);
      return true;
    }
    return undefined;
  }

  // 只有当native不处理时返回undefined，否则必须返回true，返回undefined会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回true
  protected back(location: ILocationTransform, n: number, key: string): void | true | Promise<true> {
    if (!env.isServer) {
      // this.history.go(-n);
      this._history.replace(location.getNativeUrl(true), key as any);
      return true;
    }
    return undefined;
  }

  public destroy(): void {
    this._unlistenHistory();
  }
}

export class EluxRouter<P extends RootParams, N extends string, NT = unknown> extends BaseEluxRouter<P, N, NT> {
  public declare nativeRouter: BrowserNativeRouter;

  constructor(nativeUrl: string, browserNativeRouter: BrowserNativeRouter, nativeData: NT) {
    super(nativeUrl, browserNativeRouter, nativeData);
  }
}

export function createRouter<P extends RootParams, N extends string, NT = unknown>(nativeUrl: string, nativeData: NT): EluxRouter<P, N, NT> {
  const browserNativeRouter = new BrowserNativeRouter();
  const router = new EluxRouter<P, N, NT>(nativeUrl, browserNativeRouter, nativeData);
  return router;
}
