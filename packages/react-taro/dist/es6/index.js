import { buildProvider, getAppProvider } from '@elux/core';
import { createRouter } from '@elux/route-mp';
import { taroHistory } from '@elux/taro';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
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