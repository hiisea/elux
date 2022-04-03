import _extends from "@babel/runtime/helpers/esm/extends";
import { coreConfig, buildConfigSetter } from '@elux/core';
export function urlToLocation(url) {
  var _url$split = url.split(/[?#]/),
      _url$split$ = _url$split[0],
      path = _url$split$ === void 0 ? '' : _url$split$,
      _url$split$2 = _url$split[1],
      search = _url$split$2 === void 0 ? '' : _url$split$2,
      _url$split$3 = _url$split[2],
      hash = _url$split$3 === void 0 ? '' : _url$split$3;

  var pathname = '/' + path.replace(/^\/|\/$/g, '');
  var parse = routeConfig.QueryString.parse;
  var searchQuery = parse(search);
  var hashQuery = parse(hash);
  return {
    url: "" + pathname + (search ? '?' + search : '') + (hash ? '#' + hash : ''),
    pathname: pathname,
    search: search,
    hash: hash,
    searchQuery: searchQuery,
    hashQuery: hashQuery
  };
}
export function locationToUrl(_ref) {
  var url = _ref.url,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash,
      searchQuery = _ref.searchQuery,
      hashQuery = _ref.hashQuery;

  if (url) {
    var _url$split2 = url.split(/[?#]/);

    pathname = _url$split2[0];
    search = _url$split2[1];
    hash = _url$split2[2];
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  var stringify = routeConfig.QueryString.stringify;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  return "" + pathname + (search ? '?' + search : '') + (hash ? '#' + hash : '');
}
export function toNativeLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends({}, location, {
    pathname: pathname,
    url: url
  });
}
export function toEluxLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends({}, location, {
    pathname: pathname,
    url: url
  });
}
export function testChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.AppModuleName + coreConfig.NSP + "testRouteChange",
    payload: [location, routeAction]
  };
}
export function beforeChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.AppModuleName + coreConfig.NSP + "beforeRouteChange",
    payload: [location, routeAction]
  };
}
export function afterChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.AppModuleName + coreConfig.NSP + "afterRouteChange",
    payload: [location, routeAction]
  };
}
export var routeConfig = {
  NotifyNativeRouter: {
    window: true,
    page: false
  },
  HomeUrl: '/',
  QueryString: {
    parse: function parse(str) {
      return {};
    },
    stringify: function stringify() {
      return '';
    }
  },
  NativePathnameMapping: {
    in: function _in(pathname) {
      return pathname === '/' ? routeConfig.HomeUrl : pathname;
    },
    out: function out(pathname) {
      return pathname === routeConfig.HomeUrl ? '/' : pathname;
    }
  }
};
export var setRouteConfig = buildConfigSetter(routeConfig);