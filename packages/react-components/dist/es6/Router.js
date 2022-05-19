import React, { useEffect, useRef, useState } from 'react';
import { coreConfig, env } from '@elux/core';
import { EWindow } from './EWindow';
import { jsx as _jsx } from "react/jsx-runtime";
export const RouterComponent = () => {
  const router = coreConfig.UseRouter();
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
    return router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getCurrentPages().reverse();
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
          store: store
        })
      }, store.sid);
    })
  });
};