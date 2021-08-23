import {BaseRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform, setRouteConfig} from '@elux/route';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env} from '@elux/core';

setRouteConfig({notifyNativeRouter: {root: true, internal: true}});

// export function setBrowserRouteConfig({enableMultiPage}: {enableMultiPage?: boolean}): void {
//   if (enableMultiPage) {
//     setRouteConfig({notifyNativeRouter: {root: true, internal: false}});
//   } else {
//     setRouteConfig({notifyNativeRouter: {root: false, internal: true}});
//   }
// }

type UnregisterCallback = () => void;

export class BrowserNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  public history: History<never>;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
    super();
    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      const [pathname, search = ''] = createHistory.split('?');
      this.history = {
        action: 'PUSH',
        length: 0,
        listen() {
          return () => undefined;
        },
        createHref() {
          return '';
        },
        push() {
          return undefined;
        },
        replace() {
          return undefined;
        },
        go() {
          return undefined;
        },
        goBack() {
          return undefined;
        },
        goForward() {
          return undefined;
        },
        block() {
          return () => undefined;
        },
        location: {
          pathname,
          search: search && `?${search}`,
          hash: '',
        } as any,
      };
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
    this._unlistenHistory = this.history.block((location, action) => {
      if (action === 'POP') {
        env.setTimeout(() => this.router.back(1), 100);
        return false;
      }
      const key = this.getKey(location);
      const changed = this.onChange(key);
      if (changed) {
        const {pathname = '', search = '', hash = ''} = location;
        const url = [pathname, search, hash].join('');
        let callback: () => void;
        if (action === 'REPLACE') {
          callback = () => this.router.replace(url);
        } else if (action === 'PUSH') {
          callback = () => this.router.push(url);
        } else {
          callback = () => this.router.relaunch(url);
        }
        env.setTimeout(callback, 100);
        return false;
      }
      return undefined;
    });
  }
  getUrl(): string {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return [pathname, search, hash].join('');
  }

  private getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  protected passive(url: string, key: string, action: string): boolean {
    return true;
  }

  refresh(): void {
    this.history.go(0);
  }

  protected push(getNativeData: () => NativeData, key: string): NativeData | undefined {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected replace(getNativeData: () => NativeData, key: string): NativeData | undefined {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected relaunch(getNativeData: () => NativeData, key: string): NativeData | undefined {
    if (!env.isServer) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  // 只有当native不处理时返回undefined，否则必须返回NativeData，返回undefined会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(getNativeData: () => NativeData, n: number, key: string): NativeData | undefined {
    if (!env.isServer) {
      const nativeData = getNativeData();
      // this.history.go(-n);
      this.history.replace(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  toOutside(url: string): void {
    this.history.push(url);
  }

  destroy(): void {
    this._unlistenHistory();
  }
}

export class Router<P extends RootParams, N extends string, Req = unknown, Res = unknown> extends BaseRouter<P, N, Req, Res> {
  public declare nativeRouter: BrowserNativeRouter;

  constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);
  }
}

export function createRouter<P extends RootParams, N extends string>(
  createHistory: 'Browser' | 'Hash' | 'Memory' | string,
  locationTransform: LocationTransform
): Router<P, N> {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router<P, N>(browserNativeRouter, locationTransform);
  return router;
}
