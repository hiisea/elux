"use strict";

exports.__esModule = true;
exports.RouterComponent = exports.EWindow = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var RouterComponent = (0, _vue.defineComponent)({
  setup: function setup() {
    var router = _core.coreConfig.UseRouter();

    var data = (0, _vue.shallowRef)({
      classname: 'elux-app',
      pages: router.getWindowPages().reverse()
    });
    var containerRef = (0, _vue.ref)({
      className: ''
    });
    var removeListener = router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getWindowPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            };

            _core.env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);

            _core.env.setTimeout(function () {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
            };

            _core.env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);

            _core.env.setTimeout(function () {
              data.value = {
                classname: 'elux-app ' + Date.now(),
                pages: pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              classname: 'elux-app',
              pages: pages
            };

            _core.env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            classname: 'elux-app',
            pages: pages
          };

          _core.env.setTimeout(completeCallback, 50);
        }
      });
    });
    (0, _vue.onBeforeUnmount)(function () {
      removeListener();
    });
    var appView = (0, _core.getEntryComponent)();
    return function () {
      var _data$value = data.value,
          classname = _data$value.classname,
          pages = _data$value.pages;
      return (0, _vue.createVNode)("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(function (item) {
        var store = item.store,
            url = item.url;
        return (0, _vue.createVNode)("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-url": url
        }, [(0, _vue.createVNode)(EWindow, {
          "store": store,
          "view": appView
        }, null)]);
      })]);
    };
  }
});
exports.RouterComponent = RouterComponent;
var EWindow = (0, _vue.defineComponent)({
  props: {
    store: {
      type: Object,
      required: true
    },
    view: {
      type: Object,
      required: true
    }
  },
  setup: function setup(props) {
    var storeContext = {
      store: props.store
    };
    (0, _vue.provide)(_base.EluxStoreContextKey, storeContext);
    return function () {
      return (0, _vue.h)(props.view, null);
    };
  }
});
exports.EWindow = EWindow;