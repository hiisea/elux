import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export var Router = function Router(props) {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var _useState = useState('elux-app'),
      classname = _useState[0],
      setClassname = _useState[1];

  var pages = [].concat(router.getHistory(true).getPages()).reverse();
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        if (routeState.action === 'PUSH') {
          setClassname('elux-app elux-animation elux-change ' + Date.now());
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation';
          }, 0);
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          containerRef.current.className = 'elux-app elux-animation elux-change';
          env.setTimeout(function () {
            setClassname('elux-app ' + Date.now());
          }, 1000);
        } else if (routeState.action === 'RELAUNCH') {
          setClassname('elux-app ' + Date.now());
        }
      }
    });
  }, [router]);
  var nodes = pages.map(function (item) {
    var store = item.store;
    var page = item.page ? React.createElement(item.page, {
      key: store.id,
      store: store
    }) : React.createElement(Page, {
      key: store.id,
      store: store
    }, props.children);
    return page;
  });
  return React.createElement("div", {
    ref: containerRef,
    className: classname
  }, nodes);
};
export var Page = memo(function (_ref2) {
  var store = _ref2.store,
      children = _ref2.children;
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, children));
});
export function useRouter() {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;
  return router;
}