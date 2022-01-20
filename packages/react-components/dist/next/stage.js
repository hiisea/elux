import React from 'react';
import { hydrate, render } from 'react-dom';
import { env } from '@elux/core';
import { EluxContextComponent } from './base';
import { Router } from './Router';
export function renderToMP(eluxContext) {
  const Component = ({
    children
  }) => React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, children);

  return Component;
}
export function renderToDocument(id, APPView, eluxContext, fromSSR, app, store) {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, {
    page: APPView
  })), panel);
}
export function renderToString(id, APPView, eluxContext, app, store) {
  const html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, {
    page: APPView
  })));

  return Promise.resolve(html);
}