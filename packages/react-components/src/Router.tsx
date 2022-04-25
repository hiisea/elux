import React, {useEffect, useRef, useState} from 'react';

import {coreConfig, env, IStore} from '@elux/core';

import {EWindow} from './EWindow';

export const RouterComponent: React.FC = () => {
  const router = coreConfig.UseRouter!();
  const [data, setData] = useState<{
    classname: string;
    pages: {
      url: string;
      store: IStore;
    }[];
  }>({classname: 'elux-app', pages: router.getWindowPages().reverse()});
  const {classname, pages} = data;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return router.addListener(({action, windowChanged}) => {
      const pages = router.getWindowPages().reverse();
      return new Promise<void>((completeCallback) => {
        if (windowChanged) {
          if (action === 'push') {
            setData({classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(), pages});
            env.setTimeout(() => {
              containerRef.current!.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(() => {
              containerRef.current!.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({classname: 'elux-app ' + Date.now(), pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]});
            env.setTimeout(() => {
              containerRef.current!.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              setData({classname: 'elux-app ' + Date.now(), pages});
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({classname: 'elux-app ', pages});
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({classname: 'elux-app', pages});
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return (
    <div ref={containerRef} className={classname}>
      {pages.map((item) => {
        const {store, url} = item;
        return (
          <div key={store.sid} data-sid={store.sid} className="elux-window" data-url={url}>
            <EWindow store={store}></EWindow>
          </div>
        );
      })}
    </div>
  );
};
