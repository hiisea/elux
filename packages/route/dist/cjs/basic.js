"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.ErrorCodes = void 0;
exports.afterChangeAction = afterChangeAction;
exports.beforeChangeAction = beforeChangeAction;
exports.locationToNativeLocation = locationToNativeLocation;
exports.locationToUrl = locationToUrl;
exports.nativeLocationToLocation = nativeLocationToLocation;
exports.nativeUrlToUrl = nativeUrlToUrl;
exports.setRouteConfig = exports.routeConfig = void 0;
exports.testChangeAction = testChangeAction;
exports.urlToLocation = urlToLocation;
exports.urlToNativeUrl = urlToNativeUrl;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _core = require("@elux/core");

var ErrorCodes = {
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
exports.ErrorCodes = ErrorCodes;

function nativeUrlToUrl(nativeUrl) {
  var _nativeUrl$split = nativeUrl.split(/[?#]/),
      _nativeUrl$split$ = _nativeUrl$split[0],
      path = _nativeUrl$split$ === void 0 ? '' : _nativeUrl$split$,
      _nativeUrl$split$2 = _nativeUrl$split[1],
      search = _nativeUrl$split$2 === void 0 ? '' : _nativeUrl$split$2,
      _nativeUrl$split$3 = _nativeUrl$split[2],
      hash = _nativeUrl$split$3 === void 0 ? '' : _nativeUrl$split$3;

  var pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? '?' + search : '') + (hash ? '#' + hash : '');
}

function urlToNativeUrl(eluxUrl) {
  var _eluxUrl$split = eluxUrl.split(/[?#]/),
      _eluxUrl$split$ = _eluxUrl$split[0],
      path = _eluxUrl$split$ === void 0 ? '' : _eluxUrl$split$,
      _eluxUrl$split$2 = _eluxUrl$split[1],
      search = _eluxUrl$split$2 === void 0 ? '' : _eluxUrl$split$2,
      _eluxUrl$split$3 = _eluxUrl$split[2],
      hash = _eluxUrl$split$3 === void 0 ? '' : _eluxUrl$split$3;

  var pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? '?' + search : '') + (hash ? '#' + hash : '');
}

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

function locationToNativeLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return (0, _extends2.default)({}, location, {
    pathname: pathname,
    url: url
  });
}

function nativeLocationToLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return (0, _extends2.default)({}, location, {
    pathname: pathname,
    url: url
  });
}

function testChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.StageModuleName + _core.coreConfig.NSP + "_testRouteChange",
    payload: [location, routeAction]
  };
}

function beforeChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.StageModuleName + _core.coreConfig.NSP + "_beforeRouteChange",
    payload: [location, routeAction]
  };
}

function afterChangeAction(location, routeAction) {
  return {
    type: "" + _core.coreConfig.StageModuleName + _core.coreConfig.NSP + "_afterRouteChange",
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