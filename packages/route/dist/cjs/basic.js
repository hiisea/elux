"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.afterChangeAction = afterChangeAction;
exports.beforeChangeAction = beforeChangeAction;
exports.locationToUrl = locationToUrl;
exports.setRouteConfig = exports.routeConfig = void 0;
exports.testChangeAction = testChangeAction;
exports.toEluxLocation = toEluxLocation;
exports.toNativeLocation = toNativeLocation;
exports.urlToLocation = urlToLocation;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _core = require("@elux/core");

function urlToLocation(url) {
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

function locationToUrl(_ref) {
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

function toNativeLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return (0, _extends2.default)({}, location, {
    pathname: pathname,
    url: url
  });
}

function toEluxLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return (0, _extends2.default)({}, location, {
    pathname: pathname,
    url: url
  });
}

function testChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.AppModuleName + _core.coreConfig.NSP + "testRouteChange",
    payload: [location, routeAction]
  };
}

function beforeChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.AppModuleName + _core.coreConfig.NSP + "beforeRouteChange",
    payload: [location, routeAction]
  };
}

function afterChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.AppModuleName + _core.coreConfig.NSP + "afterRouteChange",
    payload: [location, routeAction]
  };
}

var routeConfig = {
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
exports.routeConfig = routeConfig;
var setRouteConfig = (0, _core.buildConfigSetter)(routeConfig);
exports.setRouteConfig = setRouteConfig;