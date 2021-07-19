import {BaseRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform, IBaseRouter} from '@elux/route';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env} from '@elux/core';

type UnregisterCallback = () => void;

export class BrowserNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  protected declare router: Router<any, string>;

  public history: History<never>;

  private serverSide = false;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
    super();
    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      this.serverSide = true;
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
    this._unlistenHistory = this.history.block((location, action) => {
      const {pathname = '', search = '', hash = ''} = location;
      const url = [pathname, search, hash].join('');
      const key = this.getKey(location);
      const changed = this.onChange(key);
      if (changed) {
        let index = -1;
        let callback: () => void;
        if (action === 'POP') {
          index = this.router.findHistoryIndexByKey(key);
        }
        if (index > -1) {
          callback = () => this.router.back(index + 1, '', false, false);
        } else if (action === 'REPLACE') {
          callback = () => this.router.replace(url, false, false);
        } else if (action === 'PUSH') {
          callback = () => this.router.push(url, false, false);
        } else {
          callback = () => this.router.relaunch(url, false, false);
        }
        callback && env.setTimeout(callback, 50);
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
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected replace(getNativeData: () => NativeData, key: string): NativeData | undefined {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected relaunch(getNativeData: () => NativeData, key: string): NativeData | undefined {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(getNativeData: () => NativeData, n: number, key: string): NativeData | undefined {
    if (!this.serverSide) {
      const nativeData = getNativeData();
      this.history.go(-n);
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

export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> implements IRouter<P, N> {
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

export interface IRouter<P extends RootParams, N extends string> extends IBaseRouter<P, N> {
  nativeRouter: BrowserNativeRouter;
}
