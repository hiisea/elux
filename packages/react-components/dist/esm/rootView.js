import React from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export function renderToDocument(id, APP, store, eluxContext, fromSSR) {
  var renderFun = fromSSR ? hydrate : render;
  var panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APP, null))), panel);
}
export function renderToString(id, APP, store, eluxContext) {
  var html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APP, null))));

  return html;
}