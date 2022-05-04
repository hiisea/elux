import { useEffect, useRef, useState } from 'react';
import { buildProvider, coreConfig, getClientRouter, setCoreConfig } from '@elux/core';
import { EWindow } from '@elux/react-components';
import { locationToUrl } from '@elux/route';
import { createRouter } from '@elux/route-mp';
import { onShow, taroHistory } from '@elux/taro';
import { useDidHide, useDidShow } from '@tarojs/taro';
import { jsx as _jsx } from "react/jsx-runtime";
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
setCoreConfig({
  Platform: 'taro'
});
export const EluxPage = () => {
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
  return store ? _jsx(EWindow, {
    store: store
  }, store.sid) : _jsx("div", {
    className: "g-page-loading",
    children: "Loading..."
  });
};
let cientSingleton;
export function createApp(appConfig) {
  if (!cientSingleton) {
    const router = createRouter(taroHistory);
    cientSingleton = buildProvider({}, router);
  }

  const location = taroHistory.getLocation();

  if (location.pathname) {
    const router = getClientRouter();
    router.init({
      url: locationToUrl(location)
    }, {});
  }

  return cientSingleton;
}