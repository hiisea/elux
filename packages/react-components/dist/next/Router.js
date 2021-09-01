import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export const Router = props => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const [data, setData] = useState({
    classname: 'elux-app',
    pages: router.getCurrentPages().reverse()
  });
  const {
    classname,
    pages
  } = data;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const containerRef = useRef(null);
  useEffect(() => {
    return router.addListener('change', ({
      routeState,
      root
    }) => {
      if (root) {
        const pages = router.getCurrentPages().reverse();
        let completeCallback;

        if (routeState.action === 'PUSH') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          setData({
            classname: 'elux-app elux-animation elux-change ' + Date.now(),
            pages
          });
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation';
          }, 200);
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app';
            completeCallback();
          }, 500);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          setData({
            classname: 'elux-app ' + Date.now(),
            pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]
          });
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation elux-change';
          }, 200);
          env.setTimeout(() => {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages
            });
            completeCallback();
          }, 500);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          setData({
            classname: 'elux-app ' + Date.now(),
            pages
          });
        }
      }

      return;
    });
  }, [router]);
  return React.createElement("div", {
    ref: containerRef,
    className: classname
  }, pages.map(item => {
    const {
      store,
      pagename
    } = item;
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
export const Page = memo(function ({
  store,
  view
}) {
  const View = view;
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement(View, null));
});
export function useRouter() {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  return router;
}