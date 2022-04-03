"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.RouterComponent = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _jsxRuntime = require("react/jsx-runtime");

var RouterComponent = function RouterComponent(props) {
  var router = _core.coreConfig.UseRouter();

  var _useState = (0, _react.useState)({
    classname: 'elux-app',
    pages: router.getWindowPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var classname = data.classname,
      pages = data.pages;
  var pagesRef = (0, _react.useRef)(pages);
  pagesRef.current = pages;
  var containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    return router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getWindowPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            });

            _core.env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation';
            }, 100);

            _core.env.setTimeout(function () {
              containerRef.current.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [pagesRef.current[pagesRef.current.length - 1]])
            });

            _core.env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);

            _core.env.setTimeout(function () {
              setData({
                classname: 'elux-app ' + Date.now(),
                pages: pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              classname: 'elux-app ',
              pages: pages
            });

            _core.env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            classname: 'elux-app',
            pages: pages
          });

          _core.env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return (0, _jsxRuntime.jsx)("div", {
    ref: containerRef,
    className: classname,
    children: pages.map(function (item) {
      var store = item.store,
          url = item.url;
      return (0, _jsxRuntime.jsx)("div", {
        "data-sid": store.sid,
        className: "elux-window",
        "data-url": url,
        children: (0, _jsxRuntime.jsx)(EWindow, {
          store: store,
          view: props.page
        })
      }, store.sid);
    })
  });
};

exports.RouterComponent = RouterComponent;
var EWindow = (0, _react.memo)(function (_ref2) {
  var store = _ref2.store,
      view = _ref2.view;
  var View = view;
  var StoreProvider = _core.coreConfig.StoreProvider;
  return (0, _jsxRuntime.jsx)(StoreProvider, {
    store: store,
    children: (0, _jsxRuntime.jsx)(View, {})
  });
});