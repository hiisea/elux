import React, { useContext, useEffect, useState } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export const Router = props => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const [pages, setPages] = useState(router.getHistory(true).getPages());
  useEffect(() => {
    return router.addListener(({
      routeState,
      root
    }) => {
      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        const newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  const nodes = pages.map(item => {
    const page = React.createElement(item.page, {
      key: item.pagename
    }) || React.createElement(Page, {
      key: item.pagename
    }, props.children);
    return page;
  });
  return React.createElement(React.Fragment, null, nodes);
};
export const Page = function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, props.children));
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