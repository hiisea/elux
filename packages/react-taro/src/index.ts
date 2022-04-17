import {useEffect, useRef, useState} from 'react';

import {AppConfig} from '@elux/app';
import {buildProvider, coreConfig, getAppProvider, IStore, UNListener} from '@elux/core';
import {createRouter} from '@elux/route-mp';
import {taroHistory, onShow} from '@elux/taro';
import {useDidHide, useDidShow} from '@tarojs/taro';
import type {Router} from '@elux/route';

export {DocumentHead, Else, EWindow, Link, Switch} from '@elux/react-components';
export type {DocumentHeadProps, ElseProps, LinkProps, SwitchProps} from '@elux/react-components';

export {connectRedux, createSelectorHook, shallowEqual, useSelector} from '@elux/react-redux';
export type {GetProps, InferableComponentEnhancerWithProps} from '@elux/react-redux';

export * from '@elux/app';

/**
 * 在小程序Page中获取Store
 *
 * @public
 */
export function useCurrentStore(): IStore | undefined {
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
      unlink.current!();
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

  return store;
}

/**
 * @public
 */
export type EluxApp = {
  render(): Elux.Component<{children: any}>;
};

let cientSingleton: EluxApp = undefined as any;

/**
 * 创建应用(CSR)
 *
 * @param appConfig - 应用配置
 *
 * @returns
 * 返回包含`render`方法的实例
 *
 * @example
 * ```js
 * render () {
 *   const Provider = createApp(appConfig).render();
 *   return <Provider>{this.props.children}</Provider>
 * }
 * ```
 *
 * @public
 */
export function createApp(appConfig: AppConfig): EluxApp {
  if (cientSingleton) {
    return cientSingleton;
  }
  const router = createRouter(taroHistory);
  cientSingleton = {
    render() {
      return getAppProvider();
    },
  };
  return buildProvider({}, router);
}
