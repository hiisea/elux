import React, {useContext, useEffect, useState, useRef, memo} from 'react';
import {ICoreRouter, env, IStore} from '@elux/core';
import {EluxContextComponent, reactComponentsConfig} from './base';

export const Router: React.FC<{page: React.ComponentType}> = (props) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const [data, setData] = useState<{
    classname: string;
    pages: {
      pagename: string;
      store: IStore<any>;
      page?: any;
    }[];
  }>({classname: 'elux-app', pages: router.getCurrentPages().reverse()});
  const {classname, pages} = data;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return router.addListener('change', ({routeState, root}) => {
      if (root) {
        const pages = router.getCurrentPages().reverse();
        let completeCallback: () => void;
        if (routeState.action === 'PUSH') {
          const completePromise = new Promise<void>((resolve) => {
            completeCallback = resolve;
          });
          setData({classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(), pages});
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise<void>((resolve) => {
            completeCallback = resolve;
          });
          setData({classname: 'elux-app ' + Date.now(), pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]});
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(() => {
            setData({classname: 'elux-app ' + Date.now(), pages});
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          setData({classname: 'elux-app ' + Date.now(), pages});
        }
      }
      return;
    });
  }, [router]);
  return (
    <div ref={containerRef} className={classname}>
      {pages.map((item) => {
        const {store, pagename} = item;
        return (
          <div key={store.id} className="elux-page" data-pagename={pagename}>
            <Page store={store} view={item.page || props.page}></Page>
          </div>
        );
      })}
    </div>
  );
};

export const Page: React.FC<{store: IStore; view: React.ComponentType}> = memo(function ({store, view}) {
  const View = view;
  return (
    <reactComponentsConfig.Provider store={store}>
      <View />
    </reactComponentsConfig.Provider>
  );
});

export function useRouter(): ICoreRouter {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  return router;
}
