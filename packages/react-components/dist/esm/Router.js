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

        var completeCallback;

        if (routeState.action === 'PUSH') {
          var completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });
          setData({
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages: _pages
          });
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          var _completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });

          setData({
            classname: 'elux-app ' + Date.now(),
            pages: [].concat(_pages, [pagesRef.current[pagesRef.current.length - 1]])
          });
          env.setTimeout(function () {
            containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(function () {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages: _pages
            });
            completeCallback();
          }, 400);
          return _completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          setData({
            classname: 'elux-app ' + Date.now(),
            pages: _pages
          });
        }
      }

      return;
    });
  }, [router]);
  return React.createElement("div", {
    ref: containerRef,
    className: classname
  }, pages.map(function (item) {
    var store = item.store,
        pagename = item.pagename;
    return React.createElement("div", {
      key: store.id,
      className: "elux-page",
      "data-pagename": pagename
    }, React.createElement(Page, {
      store: store,
      view: item.page || props.page
    }));
  }));
};
export var Page = memo(function (_ref2) {
  var store = _ref2.store,
      view = _ref2.view;
  var View = view;
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(View, null));
});
export function useRouter() {
  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;
  return router;
}