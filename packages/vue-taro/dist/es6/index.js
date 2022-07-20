import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { buildProvider, coreConfig, setCoreConfig } from '@elux/core';
import { locationToUrl } from '@elux/route';
import { createRouter } from '@elux/route-mp';
import { onShow, taroHistory } from '@elux/taro';
import { EWindow } from '@elux/vue-components';
import { useDidHide, useDidShow } from '@tarojs/taro';
import { createApp as createCSRApp, defineComponent, onBeforeUnmount, ref } from 'vue';
export { DocumentHead, Else, Link, Switch, connectStore } from '@elux/vue-components';
export * from '@elux/app';
setCoreConfig({
  Platform: 'taro'
});
export const EluxPage = defineComponent({
  setup() {
    const router = coreConfig.UseRouter();
    const store = ref();
    let unlink;
    useDidShow(() => {
      if (!unlink) {
        unlink = router.addListener(({
          newStore
        }) => {
          store.value = newStore;
        });
      }

      onShow();
    });
    useDidHide(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    onBeforeUnmount(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    return () => store.value ? _createVNode(EWindow, {
      "store": store.value,
      "key": store.value.sid
    }, null) : _createVNode("div", {
      "className": "g-page-loading"
    }, [_createTextVNode("Loading...")]);
  }

});
let cientSingleton;
export function createApp(appConfig, appOptions = {}) {
  if (!cientSingleton) {
    const onLaunch = appOptions.onLaunch;

    appOptions.onLaunch = function (options) {
      const location = taroHistory.getLocation();
      router.init({
        url: locationToUrl(location)
      }, {});
      onLaunch && onLaunch(options);
    };

    cientSingleton = createCSRApp(appOptions);
    const router = createRouter(taroHistory);
    buildProvider(cientSingleton, router);
  }

  return cientSingleton;
}