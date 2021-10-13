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
    const {root, internal} = routeConfig.notifyNativeRouter;
    if (root || internal) {
      this._unlistenHistory = this._history.block((locationData, action) => {
        // browser与elux简化为松散关系，操作elux一定不会触发POP，触发POP一定是操作browser
        if (action === 'POP') {
          env.setTimeout(() => this.eluxRouter.back(1), 100);
          return false;
        }
        // const key = this.getKey(locationData);
        // const changed = this.onChange(key);
        // if (changed) {
        //   const {pathname = '', search = ''} = locationData;
        //   const url = ['n:/', pathname, search].join('');
        //   let callback: () => void;
        //   if (action === 'REPLACE') {
        //     callback = () => this.eluxRouter.replace(url);
        //   } else if (action === 'PUSH') {
        //     callback = () => this.eluxRouter.push(url);
        //   } else {
        //     callback = () => this.eluxRouter.relaunch(url);
        //   }
        //   env.setTimeout(callback, 100);
        //   return false;
        // }
        return undefined;
      });
    }
  }

  // private getKey(locationData: LocationData): string {
  //   return locationData.state || '';
  // }

  protected push(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
      return true;
    }
    return undefined;
  }

  protected replace(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
      return true;
    }
    return undefined;
  }

  protected relaunch(location: ILocationTransform, key: string): void | true | Promise<void> {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
      return true;
    }
    return undefined;
  }

  // 只有当native不处理时返回undefined，否则必须返回true，返回undefined会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回true
  protected back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void> {
    if (!env.isServer) {
      // this.history.go(-n);
      this._history.replace(location.getNativeUrl(true));
      return true;
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
