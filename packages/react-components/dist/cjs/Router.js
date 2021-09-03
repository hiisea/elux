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
            classname: 'elux-app elux-animation elux-change ' + Date.now(),
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
            containerRef.current.className = 'elux-app elux-animation elux-change';
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
      key: store.id,
      className: "elux-page",
      "data-pagename": pagename
    }, _react.default.createElement(Page, {
      store: store,
      view: item.page || props.page
    }));
  }));
};

exports.Router = Router;
var Page = (0, _react.memo)(function (_ref2) {
  var store = _ref2.store,
      view = _ref2.view;
  var View = view;
  return _react.default.createElement(_base.reactComponentsConfig.Provider, {
    store: store
  }, _react.default.createElement(View, null));
});
exports.Page = Page;

function useRouter() {
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  return router;
}