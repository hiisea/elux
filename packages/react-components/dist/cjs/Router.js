"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.Router = exports.EWindow = void 0;
exports.useRouter = useRouter;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

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
  return _react.default.createElement("div", {
    ref: containerRef,
    className: classname
  }, pages.map(function (item) {
    var store = item.store,
        pagename = item.pagename;
    return _react.default.createElement("div", {
      key: store.sid,
      "data-sid": store.sid,
      className: "elux-window",
      "data-pagename": pagename
    }, _react.default.createElement(EWindow, {
      store: store,
      view: item.pageComponent || props.page
    }));
  }));
};

exports.Router = Router;
var EWindow = (0, _react.memo)(function (_ref2) {
  var store = _ref2.store,
      view = _ref2.view;
  var View = view;
  return _react.default.createElement(_base.reactComponentsConfig.Provider, {
    store: store
  }, _react.default.createElement(View, null));
});
exports.EWindow = EWindow;

function useRouter() {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  return router;
}