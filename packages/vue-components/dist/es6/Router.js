import { createVNode as _createVNode } from "vue";
import { defineComponent, onBeforeUnmount, ref, shallowRef } from 'vue';
import { coreConfig, env } from '@elux/core';
import { EWindow } from './EWindow';
export const RouterComponent = defineComponent({
  setup() {
    const router = coreConfig.UseRouter();
    const data = shallowRef({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getCurrentPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages: [...pages, data.value.pages[data.value.pages.length - 1]]
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              data.value = {
                classname: 'elux-app ' + Date.now(),
                pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              classname: 'elux-app',
              pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            classname: 'elux-app',
            pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {
        classname,
        pages
      } = data.value;
      return _createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(item => {
        const {
          store,
          url
        } = item;
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