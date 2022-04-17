import { useEffect, useRef, useState } from 'react';
import { buildProvider, coreConfig, getAppProvider } from '@elux/core';
import { createRouter } from '@elux/route-mp';
import { taroHistory, onShow } from '@elux/taro';
import { useDidHide, useDidShow } from '@tarojs/taro';
export { DocumentHead, Else, EWindow, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
export function useCurrentStore() {
  var router = coreConfig.UseRouter();

  var _useState = useState(),
      store = _useState[0],
      setStore = _useState[1];

  var unlink = useRef();
  useDidShow(function () {
    if (!unlink.current) {
      unlink.current = router.addListener(function (_ref) {
        var newStore = _ref.newStore;
        setStore(newStore);
      });
    }

    onShow();
  });
  useDidHide(function () {
    if (unlink.current) {
      unlink.current();
      unlink.current = undefined;
    }
  });
  useEffect(function () {
    return function () {
      if (unlink.current) {
        unlink.current();
        unlink.current = undefined;
      }
    };
  }, []);
  return store;
}
var cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createRouter(taroHistory);
  cientSingleton = {
    render: function render() {
      return getAppProvider();
    }
  };
  return buildProvider({}, router);
}