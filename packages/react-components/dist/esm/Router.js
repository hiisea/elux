import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export var Router = function Router(props) {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var _useState = useState(router.getHistory(true).getPages()),
      pages = _useState[0],
      setPages = _useState[1];

  var containerRef = useRef(null);

  var _useState2 = useState('PUSH'),
      action = _useState2[0],
      setAction = _useState2[1];

  useEffect(function () {
    return router.addListener(function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        var newPages = router.getHistory(true).getPages();
        setAction(routeState.action);
        setPages(newPages);
      }
    });
  }, [router]);
  useEffect(function () {
    env.setTimeout(function () {
      containerRef.current.className = 'elux-app elux-change';
    }, 0);
    env.setTimeout(function () {
      containerRef.current.className = 'elux-app';
    }, 1000);
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
    className: "elux-app elux-" + action + " " + Date.now()
  }, nodes);
};
export var Page = memo(function (props) {
  var eluxContext = useContext(EluxContextComponent);
  var store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, props.children));
});
export function useRouter() {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;
  return router;
}