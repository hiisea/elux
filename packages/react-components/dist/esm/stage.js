import React from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export function renderToMP(store, eluxContext) {
  var Component = function Component(_ref) {
    var children = _ref.children;
    return React.createElement(EluxContextComponent.Provider, {
      value: eluxContext
    }, React.createElement(reactComponentsConfig.Provider, {
      store: store
    }, children));
  };

  return Component;
}
export function renderToDocument(id, APPView, store, eluxContext, fromSSR) {
  var renderFun = fromSSR ? hydrate : render;
  var panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APPView, null))), panel);
}
export function renderToString(id, APPView, store, eluxContext) {
  var html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APPView, null))));

  return Promise.resolve(html);
}