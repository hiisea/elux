import {deepMerge, moduleExists, getModuleList, isPromise} from '@elux/core';
import {routeMeta, routeConfig} from './basic';
import {extendDefault, excludeDefault} from './deep-extend';

function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = routeMeta.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}
const locationCaches = {
  getItem<T>(url: string): T | undefined {
    return;
  },
  setItem<T>(url: string, item: T): void {
    return;
  },
  updateItem<T>(url: string, data: Partial<T>): void {
    return;
  },
};
const urlParser = {
  type: {e: 'e', s: 's', n: 'n'},
  getNativeUrl(pathname: string, query: string): string {
    return this.getUrl('n', pathname, query ? `${routeConfig.paramsKey}=${encodeURIComponent(query)}` : '');
  },
  getEluxUrl(pathmatch: string, args: Record<string, any>): string {
    const search = Object.keys(args).length ? JSON.stringify(args) : '';
    return this.getUrl('e', pathmatch, search);
  },
  getStateUrl(pagename: string, payload: Record<string, any>): string {
    const search = Object.keys(payload).length ? JSON.stringify(payload) : '';
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
    return url.substr(3).split('?')[0];
  },
  getSearch(url: string): string {
    return url.replace(/^.+?(\?|$)/, '');
  },
  parseSearch(search: string): Record<string, any> {
    if (!search || search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
      return {};
    }
    return JSON.parse(search);
  },
  checkUrl(url: string): string {
    const type: 'e' | 'n' | 's' = this.type[url.charAt(0)] || 'n';
    let path: string, search: string;
    const arr = url.split('://');
    if (arr.length > 1) {
      arr.shift();
    }
    path = arr[0].split('?')[0];
    path = this.checkPath(path);
    if (type === 'e' || type === 's') {
      search = url.replace(/^.+?(\?|$)/, '');
      if (search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
        search = '';
      }
    } else {
      let arr = url.split(`${routeConfig.paramsKey}=`);
      if (arr[1]) {
        arr = arr[1].split('&');
        search = arr[0] || '';
      } else {
        search = '';
      }
    }
    return this.getUrl(type, path, search);
  },
  checkPath(path: string): string {
    path = `/${path.replace(/^\/+|\/+$/g, '')}`;
    path === '/' ? '/index' : path;
    return path;
  },
};

export interface LocationData {
  _eurl?: string;
  _nurl?: string;
  _pagename?: string;
  _payload?: Record<string, any>;
  _params?: Record<string, any>;
}

class EluxLocation implements LocationData {
  readonly _eurl?: string;
  readonly _nurl?: string;
  readonly _pagename?: string;
  readonly _payload?: Record<string, any>;
  readonly _params?: Record<string, any>;

  private _pathmatch?: string;
  private _search?: string;
  private _pathArgs?: Record<string, any>;
  private _args?: Record<string, any>;
  private _minData?: {pathmatch: string; args: Record<string, any>};

  constructor(public readonly url: string, data: LocationData) {
    Object.assign(this, data);
  }
  private update(payload: Partial<LocationData>): void {
    Object.assign(this, payload);
    locationCaches.updateItem(this.url, payload);
  }
  private getPathmatch(): string {
    if (!this._pathmatch) {
      this._pathmatch = urlParser.getPath(this.url);
    }
    return this._pathmatch;
  }
  private getSearch(): string {
    if (!this._search) {
      this._search = urlParser.getSearch(this.url);
    }
    return this._search;
  }
  private getArgs(): Record<string, any> {
    if (!this._args) {
      const search = this.getSearch();
      this._args = urlParser.parseSearch(search);
    }
    return this._args;
  }
  private getPathArgs() {
    if (!this._pathArgs) {
      const {pagenameMap, notfoundPagename} = routeMeta;
      const pagename = this.getPagename();
      const pathmatch = this.getPathmatch();
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
      this._pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].argsToParams(arrArgs) : {};
    }
  }
  private getPayload(): Record<string, any> {
    if (!this._payload) {
      const pathArgs = this.getPathArgs();
      const args = this.getArgs();
      const _payload = deepMerge({}, pathArgs, args) as Record<string, any>;
      this.update({_payload});
    }
    return this._payload!;
  }
  private getMinData(): {pathmatch: string; args: Record<string, any>} {
    if (!this._minData) {
      const minUrl = this.getEluxUrl();
      if (!this._minData) {
        const pathmatch = urlParser.getPath(minUrl);
        const search = urlParser.getSearch(minUrl);
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
  public getPagename(): string {
    if (!this._pagename) {
      const {pagenameList, notfoundPagename} = routeMeta;
      const pathmatch = this.getPathmatch();
      const __pathmatch = `${pathmatch}/`;
      const __pagename = pagenameList.find((name) => __pathmatch.startsWith(name));
      const _pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
      this.update({_pagename});
    }
    return this._pagename!;
  }
  public getFastUrl(): string {
    return this.url;
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
        pathmatch =
          _pagename +
          pathArgsArr
            .map((item) => (item ? encodeURIComponent(item) : ''))
            .join('/')
            .replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].argsToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }
      const args = excludeDefault(minPayload, pathArgs, false);
      this._minData = {pathmatch, args};
      this.update({_eurl: urlParser.getEluxUrl(pathmatch, args)});
    }
    return this._eurl!;
  }
  public getNativeUrl(): string {
    if (!this._nurl) {
      const {nativeLocationMap} = routeMeta;
      const minData = this.getMinData();
      const {pathname, query} = nativeLocationMap.out(minData);
      this.update({_nurl: urlParser.getNativeUrl(pathname, query)});
    }
    return this._nurl!;
  }
  public getParams(): Record<string, any> | Promise<Record<string, any>> {
    if (!this._params) {
      const payload = this.getPayload();
      const def = routeMeta.defaultParams;
      const asyncLoadModules = Object.keys(payload).filter((moduleName) => def[moduleName] === undefined);
      const modulesOrPromise = getModuleList(asyncLoadModules);
      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then((modules) => {
          modules.forEach((module) => {
            def[module.moduleName] = module.params;
          });
          const _params = assignDefaultData(payload);
          const modulesMap = moduleExists();
          Object.keys(_params).forEach((moduleName) => {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          this.update({_params});
          return _params;
        });
      }
      const modules = modulesOrPromise;
      modules.forEach((module) => {
        def[module.moduleName] = module.params;
      });
      const _params = assignDefaultData(payload);
      const modulesMap = moduleExists();
      Object.keys(_params).forEach((moduleName) => {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this.update({_params});
      return _params;
    } else {
      return this._params;
    }
  }
}

export function createEluxLocation(
  dataOrUrl:
    | string
    | {pathmatch: string; args: Record<string, any>}
    | {pagename: string; payload: Record<string, any>}
    | {pathname: string; query: string}
): EluxLocation {
  if (typeof dataOrUrl === 'string') {
    const url = urlParser.checkUrl(dataOrUrl);
    const type: 'e' | 'n' | 's' = url.charAt(0) as any;
    if (type === 'e') {
      return createEluxLocationFromElux(url);
    } else if (type === 's') {
      return createEluxLocationFromState(url);
    } else {
      return createEluxLocationFromNative(url);
    }
  } else if (dataOrUrl['pathmatch']) {
    const {pathmatch, args} = dataOrUrl as {pathmatch: string; args: Record<string, any>};
    const eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createEluxLocationFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    const data = dataOrUrl as {pagename: string; payload: Record<string, any>};
    const {pagename, payload} = data;
    const surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createEluxLocationFromState(surl, data);
  } else {
    const data = dataOrUrl as {pathname: string; query: string};
    const {pathname, query} = data;
    const nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createEluxLocationFromNative(nurl, data);
  }
}

function createEluxLocationFromElux(eurl: string): EluxLocation {
  let locationData = locationCaches.getItem<LocationData>(eurl);
  if (!locationData) {
    locationData = {};
    locationCaches.setItem<LocationData>(eurl, locationData);
  }
  return new EluxLocation(eurl, locationData);
}

function createEluxLocationFromNative(nurl: string, data?: {pathname: string; query: string}): EluxLocation {
  let eurl = locationCaches.getItem<string>(nurl);
  if (!eurl) {
    const {nativeLocationMap} = routeMeta;
    data = data || urlParser.parseNativeUrl(nurl);
    const {pathmatch, args} = nativeLocationMap.in(data);
    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }
  let locationData = locationCaches.getItem<LocationData>(eurl);
  if (!locationData) {
    locationData = {};
    locationCaches.setItem<LocationData>(eurl, locationData);
  }
  return new EluxLocation(eurl, locationData);
}

function createEluxLocationFromState(surl: string, data?: {pagename: string; payload: Record<string, any>}): EluxLocation {
  const eurl = `e${surl.substr(1)}`;
  let locationData = locationCaches.getItem<LocationData>(eurl);
  if (!locationData) {
    data = data || urlParser.parseStateUrl(surl);
    locationData = {_pagename: data.pagename, _payload: data.payload};
    locationCaches.setItem<LocationData>(eurl, locationData);
  } else if (!locationData._pagename || !locationData._payload) {
    data = data || urlParser.parseStateUrl(surl);
    locationCaches.updateItem<LocationData>(eurl, {_pagename: data.pagename, _payload: data.payload});
  }
  return new EluxLocation(eurl, locationData);
}
