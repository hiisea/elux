import {AppConfig} from '@elux/app';
import {buildProvider, coreConfig, getClientRouter, IStore, setCoreConfig, UNListener} from '@elux/core';
import {EWindow} from '@elux/react-components';
import type {Router} from '@elux/route';
import {locationToUrl} from '@elux/route';
import {createRouter} from '@elux/route-mp';
import {onShow, taroHistory} from '@elux/taro';
import {useDidHide, useDidShow} from '@tarojs/taro';
import {useEffect, useRef, useState} from 'react';

export {DocumentHead, Else, Link, Switch} from '@elux/react-components';
export type {DocumentHeadProps, ElseProps, LinkProps, SwitchProps} from '@elux/react-components';

export {connectRedux, createSelectorHook, shallowEqual, useSelector} from '@elux/react-redux';
export type {GetProps, InferableComponentEnhancerWithProps} from '@elux/react-redux';

export * from '@elux/app';

setCoreConfig({
  Platform: 'taro',
});

/**
 * 小程序Page页面
 *
 * @public
 */
export const EluxPage: Elux.Component = () => {
  const router = coreConfig.UseRouter!() as Router;
  const [store, setStore] = useState<IStore>();
  const unlink = useRef<UNListener>();
  useDidShow(() => {
    if (!unlink.current) {
      unlink.current = router.addListener(({newStore}) => {
        setStore(newStore);
      });
    }
    onShow();
  });
  useDidHide(() => {
    if (unlink.current) {
      unlink.current();
      unlink.current = undefined;
    }
  });
  useEffect(() => {
    return () => {
      if (unlink.current) {
        unlink.current!();
        unlink.current = undefined;
      }
    };
  }, []);

  return store ? <EWindow store={store} key={store.sid} /> : <div className="g-page-loading">Loading...</div>;
};

let cientSingleton: Elux.Component<{children: any}>;

/**
 * 创建应用
 *
 * @param appConfig - 应用配置
 *
 * @returns
 * 返回包含Provider组件
 *
 * @example
 * ```js
 * render () {
 *   const Provider = createApp(appConfig);
 *   return <Provider>{this.props.children}</Provider>
 * }
 * ```
 *
 * @public
 */
export function createApp(appConfig: AppConfig): Elux.Component<{children: any}> {
  if (!cientSingleton) {
    const router = createRouter(taroHistory);
    cientSingleton = buildProvider({}, router);
  }
  const location = taroHistory.getLocation();
  if (location.pathname) {
    const router = getClientRouter() as Router;
    router.init({url: locationToUrl(location)}, {});
  }
  return cientSingleton;
}
