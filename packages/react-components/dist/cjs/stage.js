"use strict";

exports.__esModule = true;
exports.renderToMP = renderToMP;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;
exports.Page = exports.Router = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

var _reactDom = require("react-dom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var Router = function Router(props) {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;

  var _useState = (0, _react.useState)(router.getHistory(true).getPages()),
      pages = _useState[0],
      setPages = _useState[1];

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
  var nodes = pages.map(function (item) {
    var page = _react.default.createElement(item.page, {
      key: item.pagename
    }) || _react.default.createElement(Page, {
      key: item.pagename
    }, props.children);

    return page;
  });
  return _react.default.createElement(_react.default.Fragment, null, nodes);
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

function renderToMP(store, eluxContext) {
  var Component = function Component(_ref2) {
    var children = _ref2.children;
    return _react.default.createElement(_base.EluxContextComponent.Provider, {
      value: eluxContext
    }, children);
  };

  return Component;
}

function renderToDocument(id, APPView, store, eluxContext, fromSSR) {
  var renderFun = fromSSR ? _reactDom.hydrate : _reactDom.render;

  var panel = _core.env.document.getElementById(id);

  renderFun(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(Router, null, _react.default.createElement(APPView, null))), panel);
}

function renderToString(id, APPView, store, eluxContext) {
  var html = require('react-dom/server').renderToString(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(Router, null, _react.default.createElement(APPView, null))));

  return Promise.resolve(html);
}