import { buildProvider, getAppProvider } from '@elux/core';
import { createRouter } from '@elux/route-mp';
import { taroHistory } from '@elux/taro';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
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