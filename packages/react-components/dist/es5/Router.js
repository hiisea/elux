import _extends from "@babel/runtime/helpers/esm/extends";
import { coreConfig, env } from '@elux/core';
import { memo, useEffect, useRef, useState } from 'react';
import { EWindow } from './EWindow';
import { jsx as _jsx } from "react/jsx-runtime";

var Component = function Component() {
  var router = coreConfig.UseRouter();

  var _useState = useState({
    className: 'elux-app',
    pages: router.getCurrentPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var className = data.className,
      pages = data.pages;
  var pagesRef = useRef(pages);
  pagesRef.current = pages;
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
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
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [pagesRef.current[pagesRef.current.length - 1]])
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              setData({
                className: 'elux-app ' + Date.now(),
                pages: pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              className: 'elux-app ',
              pages: pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            className: 'elux-app',
            pages: pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return _jsx("div", {
    ref: containerRef,
    className: className,
    children: pages.map(function (item, index) {
      var store = item.store,
          _item$location = item.location,
          url = _item$location.url,
          classname = _item$location.classname;
      var props = {
        className: "elux-window" + (classname ? ' ' + classname : ''),
        key: store.sid,
        sid: store.sid,
        url: url,
        style: {
          zIndex: index + 1
        }
      };
      return classname.startsWith('_') ? _jsx("article", _extends({}, props, {
        children: _jsx(EWindow, {
          store: store
        })
      })) : _jsx("div", _extends({}, props, {
        children: _jsx(EWindow, {
          store: store
        })
      }));
    })
  });
};

Component.displayName = 'EluxRouter';
export var RouterComponent = memo(Component);