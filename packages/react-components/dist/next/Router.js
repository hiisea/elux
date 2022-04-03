import React, { useEffect, useState, useRef, memo } from 'react';
import { env, coreConfig } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export const RouterComponent = props => {
  const router = coreConfig.UseRouter();
  const [data, setData] = useState({
    classname: 'elux-app',
    pages: router.getWindowPages().reverse()
  });
  const {
    classname,
    pages
  } = data;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const containerRef = useRef(null);
  useEffect(() => {
    return router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getWindowPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
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
          } else if (action === 'back') {
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
          } else if (action === 'relaunch') {
            setData({
              classname: 'elux-app ',
              pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            classname: 'elux-app',
            pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return _jsx("div", {
    ref: containerRef,
    className: classname,
    children: pages.map(item => {
      const {
        store,
        url
      } = item;
      return _jsx("div", {
        "data-sid": store.sid,
        className: "elux-window",
        "data-url": url,
        children: _jsx(EWindow, {
          store: store,
          view: props.page
        })
      }, store.sid);
    })
  });
};
const EWindow = memo(function ({
  store,
  view
}) {
  const View = view;
  const StoreProvider = coreConfig.StoreProvider;
  return _jsx(StoreProvider, {
    store: store,
    children: _jsx(View, {})
  });
});