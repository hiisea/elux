import { useEffect, useRef, useState } from 'react';
import { buildProvider, coreConfig, getAppProvider } from '@elux/core';
import { createRouter } from '@elux/route-mp';
import { taroHistory, onShow } from '@elux/taro';
import { useDidHide, useDidShow } from '@tarojs/taro';
export { DocumentHead, Else, EWindow, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
export function useCurrentStore() {
  const router = coreConfig.UseRouter();
  const [store, setStore] = useState();
  const unlink = useRef();
  useDidShow(() => {
    if (!unlink.current) {
      unlink.current = router.addListener(({
        newStore
      }) => {
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
        unlink.current();
        unlink.current = undefined;
      }
    };
  }, []);
  return store;
}
let cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  const router = createRouter(taroHistory);
  cientSingleton = {
    render() {
      return getAppProvider();
    }

  };
  return buildProvider({}, router);
}