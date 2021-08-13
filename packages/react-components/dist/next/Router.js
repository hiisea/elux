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

        if (routeState.action === 'PUSH') {
          setData({
            classname: 'elux-app elux-animation elux-change',
            pages
          });
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation';
          }, 300);
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          setData({
            classname: 'elux-app',
            pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]
          });
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation elux-change';
          }, 300);
          env.setTimeout(() => {
            setData({
              classname: 'elux-app',
              pages
            });
          }, 1000);
        } else if (routeState.action === 'RELAUNCH') {
          setData({
            classname: 'elux-app',
            pages
          });
        }
      }
    });
  }, [router]);
  const nodes = pages.map(item => {
    const store = item.store;
    const page = item.page ? React.createElement(item.page, {
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
export const Page = memo(function ({
  store,
  children
}) {
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, children));
});
export function useRouter() {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  return router;
}