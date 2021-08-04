"use strict";

exports.__esModule = true;
exports.Page = exports.Router = void 0;

var _react = _interopRequireWildcard(require("react"));

var _base = require("./base");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var Router = function Router(props) {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;

  var _useState = (0, _react.useState)(router.getHistory(true).getPages()),
      pages = _useState[0],
      setPages = _useState[1];

  var containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    return router.addListener(function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        var newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  (0, _react.useEffect)(function () {
    containerRef.current.className = 'elux-app';
  });
  var nodes = pages.reverse().map(function (item) {
    var page = item.page ? _react.default.createElement(item.page, {
      key: item.key
    }) : _react.default.createElement(Page, {
      key: item.key
    }, props.children);
    return page;
  });
  return _react.default.createElement("div", {
    ref: containerRef,
    className: "elux-app elux-enter"
  }, nodes);
};

exports.Router = Router;

var Page = function Page(props) {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var store = eluxContext.router.getCurrentStore();
  return _react.default.createElement(_base.reactComponentsConfig.Provider, {
    store: store
  }, _react.default.createElement("div", {
    className: "elux-page"
  }, props.children));
};

exports.Page = Page;