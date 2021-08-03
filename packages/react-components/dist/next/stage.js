import React, { useContext } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export const Router = props => {
  return React.createElement(Page, null, props.children);
};
export const Page = function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, props.children);
};
export function renderToMP(store, eluxContext) {
  const Component = ({
    children
  }) => React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, children);

  return Component;
}
export function renderToDocument(id, APPView, store, eluxContext, fromSSR) {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, null, React.createElement(APPView, null))), panel);
}
export function renderToString(id, APPView, store, eluxContext) {
  const html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, null, React.createElement(APPView, null))));

  return Promise.resolve(html);
}