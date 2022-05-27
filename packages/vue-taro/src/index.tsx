import {AppConfig, UNListener} from '@elux/app';
import {buildProvider, coreConfig, IStore, setCoreConfig} from '@elux/core';
import type {Router} from '@elux/route';
import {createRouter} from '@elux/route-mp';
import {onShow, taroHistory} from '@elux/taro';
import {EWindow} from '@elux/vue-components';
import {useDidHide, useDidShow} from '@tarojs/taro';
import {App, createApp as createCSRApp, defineComponent, onBeforeUnmount, ref} from 'vue';

export {DocumentHead, Else, Link, Switch} from '@elux/vue-components';
export type {DocumentHeadProps, ElseProps, LinkProps, SwitchProps} from '@elux/vue-components';

export * from '@elux/app';

setCoreConfig({
  Platform: 'taro',
});

/**
 * 小程序Page页面
 *
 * @public
 */
export const EluxPage: Elux.Component = defineComponent({
  setup() {
    const router = coreConfig.UseRouter!() as Router;
    const store = ref<IStore>();
    let unlink: UNListener | undefined;
    useDidShow(() => {
      if (!unlink) {
        unlink = router.addListener(({newStore}) => {
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
    return () => (store.value ? <EWindow store={store.value} key={store.value.sid} /> : <div className="g-page-loading">Loading...</div>);
  },
}) as any;

let cientSingleton: App;

/**
 * 创建应用
 *
 * @remarks
 * 应用唯一的创建入口
 *
 * @param appConfig - 应用配置
 * @param appOptions - 应用生命周期钩子
 *
 * @returns
 * 返回Vue实例
 *
 * @example
 * ```js
 * createApp(config, {
 *  onLaunch(){
 *  }
 * })
 * ```
 *
 * @public
 */
export function createApp(appConfig: AppConfig, appOptions: Record<string, any> = {}): App {
  if (!cientSingleton) {
    const onLaunch = appOptions.onLaunch;
    appOptions.onLaunch = function (options: any) {
      const router = createRouter(taroHistory);
      buildProvider(cientSingleton, router);
      onLaunch && onLaunch(options);
    };
    cientSingleton = createCSRApp(appOptions);
  }
  return cientSingleton;
}
