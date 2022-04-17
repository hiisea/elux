import React, { useEffect, useRef, useState } from 'react';
import { coreConfig, env } from '@elux/core';
import { EWindow } from './EWindow';
import { jsx as _jsx } from "react/jsx-runtime";
export var RouterComponent = function RouterComponent() {
  var router = coreConfig.UseRouter();

  var _useState = useState({
    classname: 'elux-app',
    pages: router.getWindowPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var classname = data.classname,
      pages = data.pages;
  var pagesRef = useRef(pages);
  pagesRef.current = pages;
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getWindowPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({
              classname: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [pagesRef.current[pagesRef.current.length - 1]])
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              setData({
                classname: 'elux-app ' + Date.now(),
                pages: pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              classname: 'elux-app ',
              pages: pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            classname: 'elux-app',
            pages: pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return _jsx("div", {
    ref: containerRef,
    className: classname,
    children: pages.map(function (item) {
      var store = item.store,
          url = item.url;
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