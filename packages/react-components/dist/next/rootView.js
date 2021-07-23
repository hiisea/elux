import React from 'react';
import { env } from '@elux/core';
import { EluxContextComponent } from './base';
import { hydrate, render } from 'react-dom';
let Provider;
export function setRootViewOptions(options) {
  options.Provider !== undefined && (Provider = options.Provider);
}
export function renderToDocument(id, APP, store, eluxContext, fromSSR) {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Provider, {
    store: store
  }, React.createElement(APP, null))), panel);
}
export function renderToString(id, APP, store, eluxContext) {
  const html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Provider, {
    store: store
  }, React.createElement(APP, null))));

  return html;
}