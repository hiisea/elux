import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { jsx as _jsx } from "react/jsx-runtime";
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
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages
          });
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app';
            completeCallback();
          }, 400);
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
            containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(() => {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages
            });
            completeCallback();
          }, 400);
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
  return _jsx("div", {
    ref: containerRef,
    className: classname,
    children: pages.map(item => {
      const {
        store,
        pagename
      } = item;
      return _jsx("div", {
        className: "elux-page",
        "data-pagename": pagename,
        children: _jsx(Page, {
          store: store,
          view: item.page || props.page
        })
      }, store.id);
    })
  });
};
export const Page = memo(function ({
  store,
  view
}) {
  const View = view;
  return _jsx(reactComponentsConfig.Provider, {
    store: store,
    children: _jsx(View, {})
  });
});
export function useRouter() {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  return router;
}