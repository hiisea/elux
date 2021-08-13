import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export var Router = function Router(props) {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var _useState = useState({
    classname: 'elux-app',
    pages: router.getCurrentPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var classname = data.classname,
      pages = data.pages;
  var pagesRef = useRef(pages);
  pagesRef.current = pages;
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        var _pages = router.getCurrentPages().reverse();

        if (routeState.action === 'PUSH') {
          setData({
            classname: 'elux-app elux-animation elux-change',
            pages: _pages
          });
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation';
          }, 300);
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          setData({
            classname: 'elux-app',
            pages: [].concat(_pages, [pagesRef.current[pagesRef.current.length - 1]])
          });
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation elux-change';
          }, 300);
          env.setTimeout(function () {
            setData({
              classname: 'elux-app',
              pages: _pages
            });
          }, 1000);
        } else if (routeState.action === 'RELAUNCH') {
          setData({
            classname: 'elux-app',
            pages: _pages
          });
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