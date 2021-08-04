import React, { useContext, useEffect, useState, useRef } from 'react';
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
    containerRef.current.className = 'elux-app';
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
    className: "elux-app elux-enter"
  }, nodes);
};
export const Page = function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router.getCurrentStore();
  return React.createElement(reactComponentsConfig.Provider, {
    store: store
  }, React.createElement("div", {
    className: "elux-page"
  }, props.children));
};