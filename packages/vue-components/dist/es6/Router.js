import { createVNode as _createVNode } from "vue";
import { coreConfig, env } from '@elux/core';
import { defineComponent, onBeforeUnmount, ref, shallowRef } from 'vue';
import { EWindow } from './EWindow';
export const RouterComponent = defineComponent({
  name: 'EluxRouter',

  setup() {
    const router = coreConfig.UseRouter();
    const data = shallowRef({
      className: 'elux-app',
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
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
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
              className: 'elux-app ' + Date.now(),
              pages: [...pages, data.value.pages[data.value.pages.length - 1]]
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
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
        className,
        pages
      } = data.value;
      return _createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map((item, index) => {
        const {
          store,
          location: {
            url,
            classname
          }
        } = item;
        const props = {
          class: `elux-window${classname ? ' ' + classname : ''}`,
          key: store.uid,
          uid: store.uid,
          sid: store.sid,
          url,
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