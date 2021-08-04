import React, { useContext, useEffect, useState } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { hydrate, render } from 'react-dom';
export var Router = function Router(props) {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var _useState = useState(router.getHistory(true).getPages()),
      pages = _useState[0],
      setPages = _useState[1];

  useEffect(function () {
    return router.addListener(function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        var newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  var nodes = pages.map(function (item) {
    var page = React.createElement(item.page, {
      key: item.pagename
    }) || React.createElement(Page, {
      key: item.pagename
    }, props.children);
    return page;
  });
  return React.createElement(React.Fragment, null, nodes);
};
export var Page = function Page(props) {
  var eluxContext = useContext(EluxContextComponent);
  var store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, props.children));
};
export function renderToMP(store, eluxContext) {
  var Component = function Component(_ref2) {
    var children = _ref2.children;
    return React.createElement(EluxContextComponent.Provider, {
      value: eluxContext
    }, children);
  };

  return Component;
}
export function renderToDocument(id, APPView, store, eluxContext, fromSSR) {
  var renderFun = fromSSR ? hydrate : render;
  var panel = env.document.getElementById(id);
  renderFun(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, null, React.createElement(APPView, null))), panel);
}
export function renderToString(id, APPView, store, eluxContext) {
  var html = require('react-dom/server').renderToString(React.createElement(EluxContextComponent.Provider, {
    value: eluxContext
  }, React.createElement(Router, null, React.createElement(APPView, null))));

  return Promise.resolve(html);
}