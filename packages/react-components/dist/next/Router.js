import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
export const Router = props => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const [classname, setClassname] = useState('elux-app');
  const pages = [...router.getHistory(true).getPages()].reverse();
  const containerRef = useRef(null);
  useEffect(() => {
    return router.addListener('change', ({
      routeState,
      root
    }) => {
      if (root) {
        if (routeState.action === 'PUSH') {
          setClassname('elux-app elux-animation elux-change ' + Date.now());
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app elux-animation';
          }, 0);
          env.setTimeout(() => {
            containerRef.current.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          containerRef.current.className = 'elux-app elux-animation elux-change';
          env.setTimeout(() => {
            setClassname('elux-app ' + Date.now());
          }, 1000);
        }
      }
    });
  }, [router]);
  const nodes = pages.map(item => {
    const page = item.page ? React.createElement(item.page, {
      key: item.key
    }) : React.createElement(Page, {
      key: item.key
    }, props.children);
    return page;
  });
  return React.createElement("div", {
    ref: containerRef,
    className: classname
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