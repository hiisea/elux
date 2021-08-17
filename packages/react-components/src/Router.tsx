import React, {useContext, useEffect, useState, useRef, memo} from 'react';
import {ICoreRouter, env, IStore} from '@elux/core';
import {EluxContextComponent, reactComponentsConfig} from './base';

export const Router: React.FC = (props) => {
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
          setData({classname: 'elux-app elux-animation elux-change ' + Date.now(), pages});
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app elux-animation';
          }, 200);
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app';
            completeCallback();
          }, 500);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise<void>((resolve) => {
            completeCallback = resolve;
          });
          setData({classname: 'elux-app ' + Date.now(), pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]});
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app elux-animation elux-change';
          }, 200);
          env.setTimeout(() => {
            setData({classname: 'elux-app ' + Date.now(), pages});
            completeCallback();
          }, 500);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          setData({classname: 'elux-app ' + Date.now(), pages});
        }
      }
      return;
    });
  }, [router]);
  const nodes = pages.map((item) => {
    const store = item.store;
    const page = item.page ? (
      <item.page key={store.id} store={store} />
    ) : (
      <Page key={store.id} store={store}>
        {props.children}
      </Page>
    );
    return page;
  });
  return (
    <div ref={containerRef} className={classname}>
      {nodes}
    </div>
  );
};

export const Page: React.FC<{store: IStore}> = memo(function ({store, children}) {
  return (
    <reactComponentsConfig.Provider store={store}>
      <div className="elux-page">{children}</div>
    </reactComponentsConfig.Provider>
  );
});

export function useRouter(): ICoreRouter {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  return router;
}
