import React, { useContext, useEffect, useState, useRef } from 'react';
import { EluxContextComponent, reactComponentsConfig } from './base';
export var Router = function Router(props) {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var _useState = useState(router.getHistory(true).getPages()),
      pages = _useState[0],
      setPages = _useState[1];

  var containerRef = useRef(null);
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
  useEffect(function () {
    containerRef.current.className = 'elux-app';
  });
  var nodes = pages.reverse().map(function (item) {
    var page = item.page ? React.createElement(item.page, {
      key: item.key
    }) : React.createElement(Page, {
      key: item.key
    }, props.children);
    return page;
  });
  return React.createElement("div", {
    ref: containerRef,
    className: "elux-app elux-enter"
  }, nodes);
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