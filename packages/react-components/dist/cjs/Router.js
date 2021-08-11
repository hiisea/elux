"use strict";

exports.__esModule = true;
exports.useRouter = useRouter;
exports.Page = exports.Router = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var Router = function Router(props) {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;

  var _useState = (0, _react.useState)('elux-app'),
      classname = _useState[0],
      setClassname = _useState[1];

  var pages = [].concat(router.getHistory(true).getPages()).reverse();
  var containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    return router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        if (routeState.action === 'PUSH') {
          setClassname('elux-app elux-animation elux-change ' + Date.now());

          _core.env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation';
          }, 0);

          _core.env.setTimeout(function () {
            containerRef.current.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          containerRef.current.className = 'elux-app elux-animation elux-change';

          _core.env.setTimeout(function () {
            setClassname('elux-app ' + Date.now());
          }, 1000);
        } else if (routeState.action === 'RELAUNCH') {
          setClassname('elux-app ' + Date.now());
        }
      }
    });
  }, [router]);
  var nodes = pages.map(function (item) {
    var store = item.store;
    var page = item.page ? _react.default.createElement(item.page, {
      key: store.id,
      store: store
    }) : _react.default.createElement(Page, {
      key: store.id,
      store: store
    }, props.children);
    return page;
  });
  return _react.default.createElement("div", {
    ref: containerRef,
    className: classname
  }, nodes);
};

exports.Router = Router;
var Page = (0, _react.memo)(function (_ref2) {
  var store = _ref2.store,
      children = _ref2.children;
  return _react.default.createElement(_base.reactComponentsConfig.Provider, {
    store: store
  }, _react.default.createElement("div", {
    className: "elux-page"
  }, children));
});
exports.Page = Page;

function useRouter() {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  return router;
}