import {Location, IRouter, UNListener, NativeRequest} from '@elux/core';
import {BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig} from '@elux/route';

setRouteConfig({NotifyNativeRouter: {window: true, page: false}});

interface RouteOption {
  url: string;
}
interface NavigateBackOption {
  delta?: number;
}

export interface IHistory {
  onRouteChange(callback: (pathname: string, search: string, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
  reLaunch(option: RouteOption): Promise<void>;
  redirectTo(option: RouteOption): Promise<void>;
  navigateTo(option: RouteOption): Promise<void>;
  navigateBack(option: NavigateBackOption): Promise<void>;
  switchTab(option: RouteOption): Promise<void>;
  getLocation(): {pathname: string; search: string};
  isTabPage(pathname: string): boolean;
}

export class MPNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;

  constructor(private history: IHistory, nativeRequest: NativeRequest) {
    super(nativeRequest);

    const {window, page} = routeConfig.NotifyNativeRouter;
    if (window || page) {
      this.unlistenHistory = history.onRouteChange((pathname: string, search: string, action) => {
        const url = [pathname, search].filter(Boolean).join('?');
        const arr = search.match(/__key__=(\w+)/);
        let key = arr ? arr[1] : '';
        //key不存在一定是TabPage，TabPage一定是只有一条记录
        if (action === 'POP' && !key) {
          const {record} = this.router.findRecordByStep(-1, false);
          key = record.key;
        }
        if (key !== this.router.routeKey) {
          if (action === 'POP') {
            this.router.back(key, 'window', null, '', true);
          } else if (action === 'REPLACE') {
            this.router.replace({url}, 'window', null, true);
          } else if (action === 'PUSH') {
            this.router.push({url}, 'window', null, true);
          } else {
            this.router.relaunch({url}, 'window', null, true);
          }
        }
      });
    }
  }

  protected addKey(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  protected _push(location: Location): void {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  protected push(location: Location, key: string): Promise<void> {
    return this.history.navigateTo({url: this.addKey(location.url, key)});
  }

  protected _replace(location: Location): void {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  protected replace(location: Location, key: string): Promise<void> {
    return this.history.redirectTo({url: this.addKey(location.url, key)});
  }

  protected relaunch(location: Location, key: string): Promise<void> {
    //TODO 如果当前页面和路由页面一致，是否不会onchange，此时应到返回false
    if (this.history.isTabPage(location.pathname)) {
      return this.history.switchTab({url: location.url});
    }
    return this.history.reLaunch({url: this.addKey(location.url, key)});
  }

  protected back(location: Location, key: string, index: [number, number]): Promise<void> {
    return this.history.navigateBack({delta: index[0]});
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createRouter(history: IHistory): IRouter {
  const nativeRequest: NativeRequest = {
    request: {url: locationToUrl(history.getLocation())},
    response: {},
  };
  const mpNativeRouter = new MPNativeRouter(history, nativeRequest);
  return mpNativeRouter.router;
}
