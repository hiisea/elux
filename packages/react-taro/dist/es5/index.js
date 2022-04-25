import { useEffect, useRef, useState } from 'react';
import { buildProvider, coreConfig, setCoreConfig } from '@elux/core';
import { EWindow } from '@elux/react-components';
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
export var EluxPage = function EluxPage() {
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
  return store ? _jsx(EWindow, {
    store: store
  }, store.sid) : _jsx("div", {
    className: "g-page-loading",
    children: "Loading..."
  });
};
var cientSingleton;
export function createApp(appConfig) {
  if (!cientSingleton) {
    var router = createRouter(taroHistory);
    cientSingleton = buildProvider({}, router);
  }

  return cientSingleton;
}