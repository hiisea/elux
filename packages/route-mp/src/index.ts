import {ILocationTransform, BaseEluxRouter, BaseNativeRouter, RootParams, setRouteConfig, routeConfig, urlParser} from '@elux/route';

setRouteConfig({notifyNativeRouter: {root: true, internal: false}});

type UnregisterCallback = () => void;
interface RouteOption {
  url: string;
}
interface NavigateBackOption {
  delta?: number;
}

export interface IHistory {
  onRouteChange(callback: (pathname: string, search: string, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
  reLaunch(option: RouteOption): Promise<any>;
  redirectTo(option: RouteOption): Promise<any>;
  navigateTo(option: RouteOption): Promise<any>;
  navigateBack(option: NavigateBackOption): Promise<any>;
  switchTab(option: RouteOption): Promise<any>;
  getLocation(): {pathname: string; search: string};
}

export class MPNativeRouter extends BaseNativeRouter {
  private _unlistenHistory?: UnregisterCallback;

  protected declare router: EluxRouter<any, string>;

  constructor(public _history: IHistory, protected tabPages: Record<string, boolean>) {
    super();
    const {root, internal} = routeConfig.notifyNativeRouter;
    if (root || internal) {
      this._unlistenHistory = _history.onRouteChange((pathname: string, search: string, action) => {
        const nativeUrl = [pathname, search].filter(Boolean).join('?');
        const arr = search.match(/__key__=(\w+)/);
        let key = arr ? arr[1] : '';
        //key不存在一定是TabPage，TabPage一定是只有一条栈
        if (action === 'POP' && !key) {
          const {record} = this.router.findRecordByStep(-1, false);
          key = record.key;
        }
        const changed = this.onChange(key);
        if (changed) {
          if (action === 'POP') {
            this.router.back(key, true, {}, true, true);
          } else if (action === 'REPLACE') {
            this.router.replace(nativeUrl, true, true, true);
          } else if (action === 'PUSH') {
            this.router.push(nativeUrl, true, true, true);
          } else {
            this.router.relaunch(nativeUrl, true, true, true);
          }
        }
      });
    }
  }

  protected addKey(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  protected push(location: ILocationTransform, key: string): void | true | Promise<void> {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');
    if (this.tabPages[pathname]) {
      return Promise.reject(`Replacing 'push' with 'relaunch' for TabPage: ${pathname}`);
    }
    return this._history.navigateTo({url: this.addKey(nativeUrl, key)});
  }

  protected replace(location: ILocationTransform, key: string): void | true | Promise<void> {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');
    if (this.tabPages[pathname]) {
      return Promise.reject(`Replacing 'replace' with 'relaunch' for TabPage: ${pathname}`);
    }
    return this._history.redirectTo({url: this.addKey(nativeUrl, key)});
  }

  protected relaunch(location: ILocationTransform, key: string): void | true | Promise<void> {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');
    if (this.tabPages[pathname]) {
      return this._history.switchTab({url: pathname});
    }
    return this._history.reLaunch({url: this.addKey(nativeUrl, key)});
  }

  // 只有当native不处理时返回undefined，否则必须返回true，返回undefined会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void> {
    return this._history.navigateBack({delta: index[0]});
  }

  public destroy(): void {
    this._unlistenHistory && this._unlistenHistory();
  }
}

export class EluxRouter<P extends RootParams, N extends string> extends BaseEluxRouter<P, N> {
  public declare nativeRouter: MPNativeRouter;

  constructor(nativeUrl: string, mpNativeRouter: MPNativeRouter) {
    super(nativeUrl, mpNativeRouter, {});
  }
}

export function createRouter<P extends RootParams, N extends string>(mpHistory: IHistory, tabPages: Record<string, boolean>): EluxRouter<P, N> {
  const mpNativeRouter = new MPNativeRouter(mpHistory, tabPages);
  const {pathname, search} = mpHistory.getLocation();
  const router = new EluxRouter<P, N>(urlParser.getUrl('n', pathname, search), mpNativeRouter);
  return router;
}
