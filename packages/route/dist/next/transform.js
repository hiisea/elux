import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { deepMerge, moduleExists, getModuleList, isPromise, RouteModel, exportModule, setCoreConfig } from '@elux/core';
import { routeMeta, routeConfig, safeJsonParse } from './basic';
import { extendDefault, excludeDefault } from './deep-extend';

class LocationCaches {
  constructor(limit) {
    _defineProperty(this, "length", 0);

    _defineProperty(this, "first", void 0);

    _defineProperty(this, "last", void 0);

    _defineProperty(this, "data", {});

    this.limit = limit;
  }

  getItem(key) {
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

    return cache == null ? void 0 : cache.payload;
  }

  setItem(key, item) {
    const data = this.data;

    if (data[key]) {
      data[key].payload = item;
      return;
    }

    const cache = {
      key,
      prev: this.last,
      next: undefined,
      payload: item
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
    return url.substr(3).split('?', 1)[0];
  },

  getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },

  stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },

  parseSearch(search) {
    return safeJsonParse(search);
  },

  checkUrl(url) {
    const type = this.type[url.charAt(0)] || 'e';
    let path, search;
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

  checkPath(path) {
    path = `/${path.replace(/^\/+|\/+$/g, '')}`;

    if (path === '/') {
      path = '/index';
    }

    return path;
  },

  withoutProtocol(url) {
    return url.replace(/^[^/]+?:\//, '');
  }

};

class LocationTransform {
  constructor(url, data) {
    _defineProperty(this, "_pagename", void 0);

    _defineProperty(this, "_payload", void 0);

    _defineProperty(this, "_params", void 0);

    _defineProperty(this, "_eurl", void 0);

    _defineProperty(this, "_nurl", void 0);

    _defineProperty(this, "_minData", void 0);

    this.url = url;
    data && this.update(data);
  }

  getPayload() {
    if (!this._payload) {
      const search = urlParser.getSearch(this.url);
      const args = urlParser.parseSearch(search);
      const {
        notfoundPagename
      } = routeConfig;
      const {
        pagenameMap
      } = routeMeta;
      const pagename = this.getPagename();
      const pathmatch = urlParser.getPath(this.url);
      const _pagename = `${pagename}/`;
      let arrArgs;

      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        const _pathmatch = `${pathmatch}/`;
        arrArgs = _pathmatch.replace(_pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
      }

      const pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].argsToParams(arrArgs) : {};
      this._payload = deepMerge({}, pathArgs, args);
    }

    return this._payload;
  }

  getMinData() {
    if (!this._minData) {
      const eluxUrl = this.getEluxUrl();

      if (!this._minData) {
        const pathmatch = urlParser.getPath(eluxUrl);
        const search = urlParser.getSearch(eluxUrl);
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

  update(data) {
    Object.keys(data).forEach(key => {
      if (data[key] && !this[key]) {
        this[key] = data[key];
      }
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
      const pathmatch = urlParser.getPath(this.url);
      const __pathmatch = `${pathmatch}/`;

      const __pagename = pagenameList.find(name => __pathmatch.startsWith(name));

      this._pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
    }

    return this._pagename;
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
        pathmatch = _pagename + pathArgsArr.map(item => item ? encodeURIComponent(item) : '').join('/');
        pathmatch = pathmatch.replace(/\/*$/, '');
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
      this._eurl = urlParser.getEluxUrl(pathmatch, args);
    }

    return this._eurl;
  }

  getNativeUrl(withoutProtocol) {
    if (!this._nurl) {
      const {
        nativeLocationMap
      } = routeMeta;
      const minData = this.getMinData();
      const {
        pathname,
        query
      } = nativeLocationMap.out(minData);
      this._nurl = urlParser.getNativeUrl(pathname, query);
    }

    return withoutProtocol ? urlParser.withoutProtocol(this._nurl) : this._nurl;
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
            def[module.moduleName] = module.routeParams;
          });

          const _params = assignDefaultData(payload);

          const modulesMap = moduleExists();
          Object.keys(_params).forEach(moduleName => {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          this._params = _params;
          return _params;
        });
      }

      const modules = modulesOrPromise;
      modules.forEach(module => {
        def[module.moduleName] = module.routeParams;
      });

      const _params = assignDefaultData(payload);

      const modulesMap = moduleExists();
      Object.keys(_params).forEach(moduleName => {
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

export function location(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    const url = urlParser.checkUrl(dataOrUrl);
    const type = url.charAt(0);

    if (type === 'e') {
      return createFromElux(url);
    } else if (type === 's') {
      return createFromState(url);
    } else {
      return createFromNative(url);
    }
  } else if (dataOrUrl['pathmatch']) {
    const {
      pathmatch,
      args
    } = dataOrUrl;
    const eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    const data = dataOrUrl;
    const {
      pagename,
      payload
    } = data;
    const surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createFromState(surl, data);
  } else {
    const data = dataOrUrl;
    const {
      pathname,
      query
    } = data;
    const nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createFromNative(nurl, data);
  }
}

function createFromElux(eurl, data) {
  let item = locationCaches.getItem(eurl);

  if (!item) {
    item = new LocationTransform(eurl, {
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._eurl || !item._nurl) {
    item.update({
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
  }

  return item;
}

function createFromNative(nurl, data) {
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

  return createFromElux(eurl, {
    nurl
  });
}

function createFromState(surl, data) {
  const eurl = `e${surl.substr(1)}`;
  let item = locationCaches.getItem(eurl);

  if (!item) {
    data = data || urlParser.parseStateUrl(surl);
    item = new LocationTransform(eurl, {
      _pagename: data.pagename,
      _payload: data.payload
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._pagename || !item._payload) {
    data = data || urlParser.parseStateUrl(surl);
    item.update({
      _pagename: data.pagename,
      _payload: data.payload
    });
  }

  return item;
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
  setCoreConfig({
    RouteModuleName: moduleName
  });
  const pagenames = Object.keys(pagenameMap);

  const _pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    const {
      argsToParams,
      paramsToArgs,
      pageData
    } = pagenameMap[pagename];
    map[fullPagename] = {
      argsToParams,
      paramsToArgs
    };
    routeMeta.pageDatas[pagename] = pageData;
    return map;
  }, {});

  routeMeta.pagenameMap = _pagenameMap;
  routeMeta.pagenameList = Object.keys(_pagenameMap);
  routeMeta.nativeLocationMap = nativeLocationMap;
  return exportModule(moduleName, RouteModel, {}, '/index');
}