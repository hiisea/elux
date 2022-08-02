import {BaseNativeRouter, coreConfig, IRouter, Location, nativeUrlToUrl, setCoreConfig, UNListener} from '@elux/core';

setCoreConfig({NotifyNativeRouter: {window: true, page: false}});

interface RouteOption {
  url: string;
}
interface NavigateBackOption {
  delta?: number;
}
export type MPLocation = {pathname: string; search: string; action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH'};
export interface IHistory {
  onRouteChange(callback: (data: MPLocation) => void): () => void;
  reLaunch(option: RouteOption): Promise<void>;
  redirectTo(option: RouteOption): Promise<void>;
  navigateTo(option: RouteOption): Promise<void>;
  navigateBack(option: NavigateBackOption): Promise<void>;
  switchTab(option: RouteOption): Promise<void>;
  getLocation(): MPLocation;
  isTabPage(pathname: string): boolean;
}

export class MPNativeRouter extends BaseNativeRouter {
  private unlistenHistory: UNListener | undefined;

  constructor(private history: IHistory) {
    super();

    const {window, page} = coreConfig.NotifyNativeRouter;
    if (window || page) {
      this.unlistenHistory = history.onRouteChange(({pathname, search, action}) => {
        let key = this.routeKey;
        if (!key) {
          //表示native主动
          const nativeUrl = [pathname, search].filter(Boolean).join('?');
          const url = nativeUrlToUrl(nativeUrl);
          if (action === 'POP') {
            const arr = `?${search}`.match(/[?&]__k=(\w+)/);
            key = arr ? arr[1] : '';
            if (!key) {
              //表示Tabpage
              this.router.back(-1, 'page', undefined, undefined, true);
            } else {
              this.router.back(key, 'page', undefined, undefined, true);
            }
          } else if (action === 'REPLACE') {
            this.router.replace({url}, 'window', undefined, true);
          } else if (action === 'PUSH') {
            this.router.push({url}, 'window', undefined, true);
          } else {
            this.router.relaunch({url}, 'window', undefined, true);
          }
        } else {
          this.onSuccess();
        }
      });
    }
  }

  protected addKey(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url.replace(/[?&]__k=(\w+)/, '')}&__k=${key}` : `${url}?__k=${key}`;
  }

  protected init(location: Location, key: string): boolean {
    return true;
  }

  protected _push(location: Location): void {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  protected push(location: Location, key: string): boolean {
    this.history.navigateTo({url: this.addKey(location.url, key)});
    return true;
  }

  protected _replace(location: Location): void {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  protected replace(location: Location, key: string): boolean {
    this.history.redirectTo({url: this.addKey(location.url, key)});
    return true;
  }

  protected relaunch(location: Location, key: string): boolean {
    //TODO 如果当前页面和路由页面一致，是否不会onchange，此时应到返回false
    if (this.history.isTabPage(location.pathname)) {
      this.history.switchTab({url: location.url});
    } else {
      this.history.reLaunch({url: this.addKey(location.url, key)});
    }
    return true;
  }

  protected back(location: Location, key: string, index: [number, number]): boolean {
    this.history.navigateBack({delta: index[0]});
    return true;
  }

  public exit(): void {
    this.history.navigateBack({delta: 99});
  }

  public destroy(): void {
    this.unlistenHistory && this.unlistenHistory();
  }
}

export function createRouter(history: IHistory): IRouter {
  const mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}
