import { coreConfig, env } from '@elux/core';
import { memo, useEffect, useRef, useState } from 'react';
import { EWindow } from './EWindow';
import { jsx as _jsx } from "react/jsx-runtime";

const Component = () => {
  const router = coreConfig.UseRouter();
  const [data, setData] = useState({
    className: 'elux-app',
    pages: router.getCurrentPages().reverse()
  });
  const {
    className,
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
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
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
              className: 'elux-app ' + Date.now(),
              pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]
            });
            env.setTimeout(() => {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              setData({
                className: 'elux-app ' + Date.now(),
                pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              className: 'elux-app ',
              pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            className: 'elux-app',
            pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return _jsx("div", {
    ref: containerRef,
    className: className,
    children: pages.map((item, index) => {
      const {
        store,
        location: {
          url,
          classname
        }
      } = item;
      const props = {
        className: `elux-window${classname ? ' ' + classname : ''}`,
        key: store.sid,
        sid: store.sid,
        url,
        style: {
          zIndex: index + 1
        }
      };
      return classname.startsWith('_') ? _jsx("article", { ...props,
        children: _jsx(EWindow, {
          store: store
        })
      }) : _jsx("div", { ...props,
        children: _jsx(EWindow, {
          store: store
        })
      });
    })
  });
};

Component.displayName = 'EluxRouter';
export const RouterComponent = memo(Component);