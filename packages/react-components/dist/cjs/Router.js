"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.Router = exports.Page = void 0;
exports.useRouter = useRouter;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

var _jsxRuntime = require("react/jsx-runtime");

var Router = function Router(props) {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;

  var _useState = (0, _react.useState)({
    classname: 'elux-app',
    pages: router.getCurrentPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var classname = data.classname,
      pages = data.pages;
  var pagesRef = (0, _react.useRef)(pages);
  pagesRef.current = pages;
  var containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    return router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        var _pages = router.getCurrentPages().reverse();

        var completeCallback;

        if (routeState.action === 'PUSH') {
          var completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });
          setData({
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages: _pages
          });

          _core.env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation';
          }, 100);

          _core.env.setTimeout(function () {
            containerRef.current.className = 'elux-app';
            completeCallback();
          }, 400);

          return completePromise;
        } else if (routeState.action === 'BACK') {
          var _completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });

          setData({
            classname: 'elux-app ' + Date.now(),
            pages: [].concat(_pages, [pagesRef.current[pagesRef.current.length - 1]])
          });

          _core.env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);

          _core.env.setTimeout(function () {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages: _pages
            });
            completeCallback();
          }, 400);

          return _completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          setData({
            classname: 'elux-app ' + Date.now(),
            pages: _pages
          });
        }
      }

      return;
    });
  }, [router]);
  return (0, _jsxRuntime.jsx)("div", {
    ref: containerRef,
    className: classname,
    children: pages.map(function (item) {
      var store = item.store,
          pagename = item.pagename;
      return (0, _jsxRuntime.jsx)("div", {
        className: "elux-page",
        "data-pagename": pagename,
        children: (0, _jsxRuntime.jsx)(Page, {
          store: store,
          view: item.page || props.page
        })
      }, store.id);
    })
  });
};

exports.Router = Router;
var Page = (0, _react.memo)(function (_ref2) {
  var store = _ref2.store,
      view = _ref2.view;
  var View = view;
  return (0, _jsxRuntime.jsx)(_base.reactComponentsConfig.Provider, {
    store: store,
    children: (0, _jsxRuntime.jsx)(View, {})
  });
});
exports.Page = Page;

function useRouter() {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  return router;
}