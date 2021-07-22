import React from 'react';
import { Provider } from '@elux/react-redux';
import { setConfig } from '@elux/react-web';

var appViewBuilder = function appViewBuilder(View, store) {
  return React.createElement(Provider, {
    store: store
  }, React.createElement(View, null));
};

setConfig({
  appViewBuilder: appViewBuilder
});
export * from '@elux/react-web';
export * from '@elux/react-redux';