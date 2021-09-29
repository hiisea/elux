import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { deepMerge, moduleExists, getModuleList, isPromise, RouteModuleHandlers, exportModule } from '@elux/core';
import { routeMeta, routeConfig } from './basic';
import { extendDefault, excludeDefault } from './deep-extend';
const locationCaches = {
  getItem(url) {
    return;
  },

  setItem(url, item) {
    return;
  },

  updateItem(url, data) {
    return;
  }

};
export const urlParser = {
  type: {
    e: 'e',
    s: 's',
    n: 'n'
  },

  getNativeUrl(pathname, query) {
    return this.getUrl('n', pathname, query ? `${routeConfig.paramsKey}=${encodeURIComponent(query)}` : '');
  },

  getEluxUrl(pathmatch, args) {
    const search = this.stringifySearch(args);
    return this.getUrl('e', pathmatch, search);
  },

  getStateUrl(pagename, payload) {
    const search = this.stringifySearch(payload);
    return this.getUrl('s', pagename, search);
  },

  parseNativeUrl(nurl) {
    const pathname = this.getPath(nurl);
    const arr = nurl.split(`${routeConfig.paramsKey}=`);
    const query = arr[1] || '';
    return {
      pathname,
      query: decodeURIComponent(query)
    };
  },

  parseStateUrl(surl) {
    const pagename = this.getPath(surl);
    const search = this.getSearch(surl);
    const payload = this.parseSearch(search);
    return {
      pagename,
      payload
    };
  },

  getUrl(type, path, search) {
    return [type, ':/', path, search && search !== '{}' ? `?${search}` : ''].join('');
  },

  getPath(url) {
    return url.substr(3).split('?')[0];
  },

  getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },

  stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },

  parseSearch(search) {
    if (!search || search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
      return {};
    }

    return JSON.parse(search);
  },

  checkUrl(url) {
    const type = this.type[url.charAt(0)] || 'n';
    let path, search;
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

  checkPath(path) {
    path = `/${path.replace(/^\/+|\/+$/g, '')}`;
    path === '/' ? '/index' : path;
    return path;
  }

};
export class LocationTransform {
  constructor(url, data) {
    _defineProperty(this, "_eurl", void 0);

    _defineProperty(this, "_nurl", void 0);

    _defineProperty(this, "_pagename", void 0);

    _defineProperty(this, "_payload", void 0);

    _defineProperty(this, "_params", void 0);

    _defineProperty(this, "_pathmatch", void 0);

    _defineProperty(this, "_search", void 0);

    _defineProperty(this, "_pathArgs", void 0);

    _defineProperty(this, "_args", void 0);

    _defineProperty(this, "_minData", void 0);

    this.url = url;
    Object.assign(this, data);
  }

  update(payload) {
    Object.assign(this, payload);
    locationCaches.updateItem(this.url, payload);
  }

  getPathmatch() {
    if (!this._pathmatch) {
      this._pathmatch = urlParser.getPath(this.url);
    }

    return this._pathmatch;
  }

  getSearch() {
    if (!this._search) {
      this._search = urlParser.getSearch(this.url);
    }

    return this._search;
  }

  getArgs() {
    if (!this._args) {
      const search = this.getSearch();
      this._args = urlParser.parseSearch(search);
    }

    return this._args;
  }

  getPathArgs() {
    if (!this._pathArgs) {
      const {
        notfoundPagename
      } = routeConfig;
      const {
        pagenameMap
      } = routeMeta;
      const pagename = this.getPagename();
      const pathmatch = this.getPathmatch();
      const _pagename = `${pagename}/`;
      let arrArgs;

      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        const _pathmatch = `${pathmatch}/`;
        arrArgs = _pathmatch.replace(_pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
      }

      this._pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].argsToParams(arrArgs) : {};
    }
  }

  getPayload() {
    if (!this._payload) {
      const pathArgs = this.getPathArgs();
      const args = this.getArgs();

      const _payload = deepMerge({}, pathArgs, args);

      this.update({
        _payload
      });
    }

    return this._payload;
  }

  getMinData() {
    if (!this._minData) {
      const minUrl = this.getEluxUrl();

      if (!this._minData) {
        const pathmatch = urlParser.getPath(minUrl);
        const search = urlParser.getSearch(minUrl);
        this._minData = {
          pathmatch,
          args: urlParser.parseSearch(search)
        };
      }
    }

    return this._minData;
  }

  toStringArgs(arr) {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  getPagename() {
    if (!this._pagename) {
      const {
        notfoundPagename
      } = routeConfig;
      const {
        pagenameList
      } = routeMeta;
      const pathmatch = this.getPathmatch();
      const __pathmatch = `${pathmatch}/`;

      const __pagename = pagenameList.find(name => __pathmatch.startsWith(name));

      const _pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;

      this.update({
        _pagename
      });
    }

    return this._pagename;
  }

  getFastUrl() {
    return this.url;
  }

  getEluxUrl() {
    if (!this._eurl) {
      const payload = this.getPayload();
      const minPayload = excludeDefault(payload, routeMeta.defaultParams, true);
      const pagename = this.getPagename();
      const {
        pagenameMap
      } = routeMeta;
      const _pagename = `${pagename}/`;
      let pathmatch;
      let pathArgs;

      if (pagenameMap[_pagename]) {
        const pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToArgs(minPayload));
        pathmatch = _pagename + pathArgsArr.map(item => item ? encodeURIComponent(item) : '').join('/').replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].argsToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }

      const args = excludeDefault(minPayload, pathArgs, false);
      this._minData = {
        pathmatch,
        args
      };
      this.update({
        _eurl: urlParser.getEluxUrl(pathmatch, args)
      });
    }

    return this._eurl;
  }

  getNativeUrl() {
    if (!this._nurl) {
      const {
        nativeLocationMap
      } = routeMeta;
      const minData = this.getMinData();
      const {
        pathname,
        query
      } = nativeLocationMap.out(minData);
      this.update({
        _nurl: urlParser.getNativeUrl(pathname, query)
      });
    }

    return this._nurl;
  }

  getParams() {
    if (!this._params) {
      const payload = this.getPayload();
      const def = routeMeta.defaultParams;
      const asyncLoadModules = Object.keys(payload).filter(moduleName => def[moduleName] === undefined);
      const modulesOrPromise = getModuleList(asyncLoadModules);

      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then(modules => {
          modules.forEach(module => {
            def[module.moduleName] = module.params;
          });

          const _params = assignDefaultData(payload);

          const modulesMap = moduleExists();
          Object.keys(_params).forEach(moduleName => {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          this.update({
            _params
          });
          return _params;
        });
      }

      const modules = modulesOrPromise;
      modules.forEach(module => {
        def[module.moduleName] = module.params;
      });

      const _params = assignDefaultData(payload);

      const modulesMap = moduleExists();
      Object.keys(_params).forEach(moduleName => {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this.update({
        _params
      });
      return _params;
    } else {
      return this._params;
    }
  }

}
export function createLocationTransform(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    const url = urlParser.checkUrl(dataOrUrl);
    const type = url.charAt(0);

    if (type === 'e') {
      return createEluxLocationFromElux(url);
    } else if (type === 's') {
      return createEluxLocationFromState(url);
    } else {
      return createEluxLocationFromNative(url);
    }
  } else if (dataOrUrl['pathmatch']) {
    const {
      pathmatch,
      args
    } = dataOrUrl;
    const eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createEluxLocationFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    const data = dataOrUrl;
    const {
      pagename,
      payload
    } = data;
    const surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createEluxLocationFromState(surl, data);
  } else {
    const data = dataOrUrl;
    const {
      pathname,
      query
    } = data;
    const nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createEluxLocationFromNative(nurl, data);
  }
}

function createEluxLocationFromElux(eurl) {
  let locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    locationData = {};
    locationCaches.setItem(eurl, locationData);
  }

  return new LocationTransform(eurl, locationData);
}

function createEluxLocationFromNative(nurl, data) {
  let eurl = locationCaches.getItem(nurl);

  if (!eurl) {
    const {
      nativeLocationMap
    } = routeMeta;
    data = data || urlParser.parseNativeUrl(nurl);
    const {
      pathmatch,
      args
    } = nativeLocationMap.in(data);
    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }

  let locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    locationData = {};
    locationCaches.setItem(eurl, locationData);
  }

  return new LocationTransform(eurl, locationData);
}

function createEluxLocationFromState(surl, data) {
  const eurl = `e${surl.substr(1)}`;
  let locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    data = data || urlParser.parseStateUrl(surl);
    locationData = {
      _pagename: data.pagename,
      _payload: data.payload
    };
    locationCaches.setItem(eurl, locationData);
  } else if (!locationData._pagename || !locationData._payload) {
    data = data || urlParser.parseStateUrl(surl);
    locationCaches.updateItem(eurl, {
      _pagename: data.pagename,
      _payload: data.payload
    });
  }

  return new LocationTransform(eurl, locationData);
}

function assignDefaultData(data) {
  const def = routeMeta.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

const defaultNativeLocationMap = {
  in(nativeLocation) {
    const {
      pathname,
      query
    } = nativeLocation;
    return {
      pathmatch: pathname,
      args: urlParser.parseSearch(query)
    };
  },

  out(eluxLocation) {
    const {
      pathmatch,
      args
    } = eluxLocation;
    return {
      pathname: pathmatch,
      query: urlParser.stringifySearch(args)
    };
  }

};
export function createRouteModule(moduleName, pagenameMap, nativeLocationMap = defaultNativeLocationMap) {
  const pagenames = Object.keys(pagenameMap);

  const _pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    const {
      argsToParams,
      paramsToArgs,
      page
    } = pagenameMap[pagename];
    map[fullPagename] = {
      argsToParams,
      paramsToArgs
    };
    routeMeta.pagenames[pagename] = pagename;
    routeMeta.pages[pagename] = page;
    return map;
  }, {});

  routeMeta.pagenameMap = _pagenameMap;
  routeMeta.pagenameList = Object.keys(_pagenameMap);
  routeMeta.nativeLocationMap = nativeLocationMap;
  return exportModule(moduleName, RouteModuleHandlers, {}, {});
}