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
  const nodes = pages.map(item => {
    const store = item.store;
    const page = item.page ? React.createElement(item.page, {
      key: store.id,
      store: store,
      pagename: item.pagename
    }) : React.createElement(Page, {
      key: store.id,
      store: store,
      pagename: item.pagename
    }, props.children);
    return page;
  });
  return React.createElement("div", {
    ref: containerRef,
    className: classname
  }, nodes);
};
export const Page = memo(function ({
  store,
  pagename,
  children
}) {
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page",
    "data-pagename": pagename
  }, children));
});
export function useRouter() {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  return router;
}