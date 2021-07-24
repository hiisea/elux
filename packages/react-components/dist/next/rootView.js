import React from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export function renderToDocument(id, APPView, store, eluxContext, fromSSR) {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APPView, null))), panel);
}
export function renderToString(id, APPView, store, eluxContext) {
  const html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(APPView, null))));

  return Promise.resolve(html);
}