import {deepMerge, moduleExists, getModuleList, isPromise, RootState, RouteModel, exportModule, setCoreConfig} from '@elux/core';
import {routeMeta, routeConfig, NativeLocationMap, PagenameMap, EluxLocation, NativeLocation, StateLocation, safeJsonParse} from './basic';
import {extendDefault, excludeDefault} from './deep-extend';

interface CacheItem {
  key: string;
  prev: CacheItem | undefined;
  next: CacheItem | undefined;
  payload: any;
}
class LocationCaches {
  private length = 0;
  private first: CacheItem | undefined;
  private last: CacheItem | undefined;
  private data: Record<string, CacheItem | undefined> = {};
  constructor(private limit: number) {}
  getItem<T>(key: string): T | undefined {
    const data = this.data;
    const cache = data[key];
    if (cache && cache.next) {
      const nextCache = cache.next;
      delete data[key];
      data[key] = cache;
      nextCache.prev = cache.prev;
      cache.prev = this.last;
      cache.next = undefined;
      this.last = cache;
      if (this.first === cache) {
        this.first = nextCache;
      }
    }
    return cache?.payload;
  }
  setItem<T>(key: string, item: T): void {
    const data = this.data;
    if (data[key]) {
      data[key]!.payload = item;
      return;
    }
    const cache: CacheItem = {
      key,
      prev: this.last,
      next: undefined,
      payload: item,
    };
    data[key] = cache;
    if (this.last) {
      this.last.next = cache;
    }
    this.last = cache;
    if (!this.first) {
      this.first = cache;
    }
    const length = this.length + 1;
    if (length > this.limit) {
      const firstCache = this.first;
      delete data[firstCache.key];
      this.first = firstCache.next;
    } else {
      this.length = length;
    }
    return;
  }
}
const locationCaches = new LocationCaches(routeConfig.maxLocationCache);

export const urlParser = {
  type: {e: 'e', s: 's', n: 'n'},
  getNativeUrl(pathname: string, query: string): string {
    return this.getUrl('n', pathname, query ? `${routeConfig.paramsKey}=${encodeURIComponent(query)}` : '');
  },
  getEluxUrl(pathmatch: string, args: Record<string, any>): string {
    const search = this.stringifySearch(args);
    return this.getUrl('e', pathmatch, search);
  },
  getStateUrl(pagename: string, payload: Record<string, any>): string {
    const search = this.stringifySearch(payload);
    return this.getUrl('s', pagename, search);
  },
  parseNativeUrl(nurl: string): {pathname: string; query: string} {
    const pathname = this.getPath(nurl);
    const arr = nurl.split(`${routeConfig.paramsKey}=`);
    const query: string = arr[1] || '';
    return {pathname, query: decodeURIComponent(query)};
  },
  parseStateUrl(surl: string): {pagename: string; payload: Record<string, any>} {
    const pagename = this.getPath(surl);
    const search = this.getSearch(surl);
    const payload = this.parseSearch(search);
    return {pagename, payload};
  },
  getUrl(type: 'e' | 'n' | 's', path: string, search: string): string {
    return [type, ':/', path, search && search !== '{}' ? `?${search}` : ''].join('');
  },
  getPath(url: string): string {
    return url.substr(3).split('?', 1)[0];
  },
  getSearch(url: string): string {
    return url.replace(/^.+?(\?|$)/, '');
  },
  stringifySearch(data: Record<string, any>): string {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },
  parseSearch(search: string): Record<string, any> {
    return safeJsonParse(search);
  },
  checkUrl(url: string): string {
    const type: 'e' | 'n' | 's' = this.type[url.charAt(0)] || 'e';
    let path: string, search: string;
    const arr = url.split('://', 2);
    if (arr.length > 1) {
      arr.shift();
    }
    path = arr[0].split('?', 1)[0];
    path = this.checkPath(path);
    if (type === 'e' || type === 's') {
      search = url.replace(/^.+?(\?|$)/, '');
      if (search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
        search = '';
      }
    } else {
      let arr = url.split(`${routeConfig.paramsKey}=`, 2);
      if (arr[1]) {
        arr = arr[1].split('&', 1);
        if (arr[0]) {
          search = `${routeConfig.paramsKey}=${arr[0]}`;
        } else {
          search = '';
        }
      } else {
        search = '';
      }
    }
    return this.getUrl(type, path, search);
  },
  checkPath(path: string): string {
    path = `/${path.replace(/^\/+|\/+$/g, '')}`;
    if (path === '/') {
      path = '/index';
    }
    return path;
  },
  withoutProtocol(url: string): string {
    return url.replace(/^[^/]+?:\//, '');
  },
};

interface LocationCache {
  _eurl?: string;
  _nurl?: string;
  _pagename?: string;
  _payload?: Record<string, any>;
  _params?: Record<string, any>;
}

/*** @public */
export interface ULocationTransform {
  getPagename(): string;
  getEluxUrl(): string;
  getNativeUrl(withoutProtocol?: boolean): string;
  getParams(): RootState | Promise<RootState>;
}
/**
 * pagename,payload,params,eurl(pathmatch,args),nurl
 */
class LocationTransform implements ULocationTransform, LocationCache {
  _pagename?: string;
  _payload?: Record<string, any>;
  _params?: RootState;
  _eurl?: string;
  _nurl?: string;
  private _minData?: {pathmatch: string; args: Record<string, any>};
  constructor(private readonly url: string, data?: LocationCache) {
    data && this.update(data);
  }
  private getPayload(): Record<string, any> {
    if (!this._payload) {
      const search = urlParser.getSearch(this.url);
      const args = urlParser.parseSearch(search);
      const {notfoundPagename} = routeConfig;
      const {pagenameMap} = routeMeta;
      const pagename = this.getPagename();
      const pathmatch = urlParser.getPath(this.url);
      const _pagename = `${pagename}/`;
      let arrArgs: Array<string | undefined>;
      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        const _pathmatch = `${pathmatch}/`;
        arrArgs = _pathmatch
          .replace(_pagename, '')
          .split('/')
          .map((item) => (item ? decodeURIComponent(item) : undefined));
      }
      const pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].argsToParams(arrArgs) : {};
      this._payload = deepMerge({}, pathArgs, args) as Record<string, any>;
    }
    return this._payload;
  }
  private getMinData(): {pathmatch: string; args: Record<string, any>} {
    if (!this._minData) {
      const eluxUrl = this.getEluxUrl();
      if (!this._minData) {
        const pathmatch = urlParser.getPath(eluxUrl);
        const search = urlParser.getSearch(eluxUrl);
        this._minData = {pathmatch, args: urlParser.parseSearch(search)};
      }
    }
    return this._minData;
  }
  private toStringArgs(arr: any[]): Array<string | undefined> {
    return arr.map((item) => {
      if (item === null || item === undefined) {
        return undefined;
      }
      return item.toString();
    });
  }
  public update(data: LocationCache): void {
    Object.keys(data).forEach((key) => {
      if (data[key] && !this[key]) {
        this[key] = data[key];
      }
    });
  }
  public getPagename(): string {
    if (!this._pagename) {
      const {notfoundPagename} = routeConfig;
      const {pagenameList} = routeMeta;
      const pathmatch = urlParser.getPath(this.url);
      const __pathmatch = `${pathmatch}/`;
      const __pagename = pagenameList.find((name) => __pathmatch.startsWith(name));
      this._pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
    }
    return this._pagename;
  }
  public getEluxUrl(): string {
    if (!this._eurl) {
      const payload = this.getPayload();
      const minPayload = excludeDefault(payload, routeMeta.defaultParams, true);
      const pagename = this.getPagename();
      const {pagenameMap} = routeMeta;
      const _pagename = `${pagename}/`;
      let pathmatch: string;
      let pathArgs: Record<string, any>;
      if (pagenameMap[_pagename]) {
        const pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToArgs(minPayload));
        pathmatch = _pagename + pathArgsArr.map((item) => (item ? encodeURIComponent(item) : '')).join('/');
        pathmatch = pathmatch.replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].argsToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }
      const args = excludeDefault(minPayload, pathArgs, false);
      this._minData = {pathmatch, args};
      this._eurl = urlParser.getEluxUrl(pathmatch, args);
    }
    return this._eurl;
  }
  public getNativeUrl(withoutProtocol?: boolean): string {
    if (!this._nurl) {
      const {nativeLocationMap} = routeMeta;
      const minData = this.getMinData();
      const {pathname, query} = nativeLocationMap.out(minData);
      this._nurl = urlParser.getNativeUrl(pathname, query);
    }
    return withoutProtocol ? urlParser.withoutProtocol(this._nurl) : this._nurl;
  }
  public getParams(): RootState | Promise<RootState> {
    if (!this._params) {
      const payload = this.getPayload();
      const def = routeMeta.defaultParams;
      const asyncLoadModules = Object.keys(payload).filter((moduleName) => def[moduleName] === undefined);
      const modulesOrPromise = getModuleList(asyncLoadModules);
      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then((modules) => {
          modules.forEach((module) => {
            def[module.moduleName] = module.routeParams;
          });
          const _params: any = assignDefaultData(payload);
          const modulesMap = moduleExists();
          Object.keys(_params).forEach((moduleName) => {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          this._params = _params;
          return _params;
        });
      }
      const modules = modulesOrPromise;
      modules.forEach((module) => {
        def[module.moduleName] = module.routeParams;
      });
      const _params: any = assignDefaultData(payload);
      const modulesMap = moduleExists();
      Object.keys(_params).forEach((moduleName) => {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this._params = _params;
      return _params;
    } else {
      return this._params;
    }
  }
}

/*** @public */
export function location(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation): ULocationTransform {
  if (typeof dataOrUrl === 'string') {
    const url = urlParser.checkUrl(dataOrUrl);
    const type: 'e' | 'n' | 's' = url.charAt(0) as any;
    if (type === 'e') {
      return createFromElux(url);
    } else if (type === 's') {
      return createFromState(url);
    } else {
      return createFromNative(url);
    }
  } else if (dataOrUrl['pathmatch']) {
    const {pathmatch, args} = dataOrUrl as EluxLocation;
    const eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    const data = dataOrUrl as StateLocation;
    const {pagename, payload} = data;
    const surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createFromState(surl, data);
  } else {
    const data = dataOrUrl as NativeLocation;
    const {pathname, query} = data;
    const nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createFromNative(nurl, data);
  }
}

function createFromElux(eurl: string, data?: {nurl?: string}): LocationTransform {
  let item = locationCaches.getItem<LocationTransform>(eurl);
  if (!item) {
    item = new LocationTransform(eurl, {_eurl: eurl, _nurl: data?.nurl});
    locationCaches.setItem(eurl, item);
  } else if (!item._eurl || !item._nurl) {
    item.update({_eurl: eurl, _nurl: data?.nurl});
  }
  return item;
}

function createFromNative(nurl: string, data?: NativeLocation): LocationTransform {
  let eurl = locationCaches.getItem<string>(nurl);
  if (!eurl) {
    const {nativeLocationMap} = routeMeta;
    data = data || urlParser.parseNativeUrl(nurl);
    const {pathmatch, args} = nativeLocationMap.in(data);
    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }
  return createFromElux(eurl, {nurl});
}

function createFromState(surl: string, data?: StateLocation): LocationTransform {
  const eurl = `e${surl.substr(1)}`;
  let item = locationCaches.getItem<LocationTransform>(eurl);
  if (!item) {
    data = data || urlParser.parseStateUrl(surl);
    item = new LocationTransform(eurl, {_pagename: data.pagename, _payload: data.payload});
    locationCaches.setItem(eurl, item);
  } else if (!item._pagename || !item._payload) {
    data = data || urlParser.parseStateUrl(surl);
    item.update({_pagename: data.pagename, _payload: data.payload});
  }
  return item;
}

function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = routeMeta.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

const defaultNativeLocationMap: NativeLocationMap = {
  in(nativeLocation) {
    const {pathname, query} = nativeLocation;
    return {pathmatch: pathname, args: urlParser.parseSearch(query)};
  },
  out(eluxLocation) {
    const {pathmatch, args} = eluxLocation;
    return {pathname: pathmatch, query: urlParser.stringifySearch(args)};
  },
};

/*** @public */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRouteModule<G extends PagenameMap, N extends string>(
  moduleName: N,
  pagenameMap: G,
  nativeLocationMap: NativeLocationMap = defaultNativeLocationMap
) {
  setCoreConfig({RouteModuleName: moduleName});
  const pagenames = Object.keys(pagenameMap);
  const _pagenameMap = pagenames
    .sort((a, b) => b.length - a.length)
    .reduce((map, pagename) => {
      const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
      const {argsToParams, paramsToArgs, pageData} = pagenameMap[pagename];
      map[fullPagename] = {argsToParams, paramsToArgs};
      //routeMeta.pagenames[pagename] = pagename;
      routeMeta.pageDatas[pagename] = pageData;
      return map;
    }, {});

  routeMeta.pagenameMap = _pagenameMap;
  routeMeta.pagenameList = Object.keys(_pagenameMap);
  routeMeta.nativeLocationMap = nativeLocationMap;

  return exportModule(moduleName, RouteModel, {}, '/index' as keyof G);
}
