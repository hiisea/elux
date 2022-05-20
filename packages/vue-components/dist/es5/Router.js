import { createVNode as _createVNode } from "vue";
import { defineComponent, onBeforeUnmount, ref, shallowRef } from 'vue';
import { coreConfig, env } from '@elux/core';
import { EWindow } from './EWindow';
export var RouterComponent = defineComponent({
  setup: function setup() {
    var router = coreConfig.UseRouter();
    var data = shallowRef({
      className: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = ref({
      className: ''
    });
    var removeListener = router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages: pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages: pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
            pages: pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          className = _data$value.className,
          pages = _data$value.pages;
      return _createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map(function (item, index) {
        var store = item.store,
            _item$location = item.location,
            url = _item$location.url,
            classname = _item$location.classname;
        var props = {
          class: "elux-window" + (classname ? ' ' + classname : ''),
          key: store.sid,
          sid: store.sid,
          url: url,
          style: {
            zIndex: index + 1
          }
        };
        return classname.startsWith('_') ? _createVNode("article", props, [_createVNode(EWindow, {
          "store": store
        }, null)]) : _createVNode("div", props, [_createVNode(EWindow, {
          "store": store
        }, null)]);
      })]);
    };
  }
});