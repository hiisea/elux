import { createVNode as _createVNode } from "vue";
import { defineComponent, onBeforeUnmount, ref, shallowRef } from 'vue';
import { coreConfig, env } from '@elux/core';
import { EWindow } from './EWindow';
export var RouterComponent = defineComponent({
  setup: function setup() {
    var router = coreConfig.UseRouter();
    var data = shallowRef({
      classname: 'elux-app',
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
              classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
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
              classname: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
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
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            classname: 'elux-app',
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
          classname = _data$value.classname,
          pages = _data$value.pages;
      return _createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(function (item) {
        var store = item.store,
            url = item.url;
        return _createVNode("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-url": url
        }, [_createVNode(EWindow, {
          "store": store
        }, null)]);
      })]);
    };
  }
});