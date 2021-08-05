import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export const Router = props => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const [pages, setPages] = useState(router.getHistory(true).getPages());
  const containerRef = useRef(null);
  useEffect(() => {
    return router.addListener(({
      routeState,
      root
    }) => {
      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        const newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  useEffect(() => {
    env.setTimeout(() => {
      containerRef.current.className = 'elux-app elux-change';
    }, 0);
    env.setTimeout(() => {
      containerRef.current.className = 'elux-app';
    }, 1000);
  });
  const nodes = pages.reverse().map(item => {
    const page = item.page ? React.createElement(item.page, {
      key: item.key
    }) : React.createElement(Page, {
      key: item.key
    }, props.children);
    return page;
  });
  return React.createElement("div", {
    ref: containerRef,
    className: 'elux-app elux-enter ' + Date.now()
  }, nodes);
};
export const Page = memo(function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, props.children));
});
export function useRouter() {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  return router;
}