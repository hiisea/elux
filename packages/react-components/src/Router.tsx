import React, {useContext, useEffect, useState, useRef, memo} from 'react';
import {ICoreRouter, env, IStore} from '@elux/core';
import {EluxContextComponent, reactComponentsConfig} from './base';

export const Router: React.FC = (props) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const [classname, setClassname] = useState('elux-app');
  const pages = [...router.getHistory(true).getPages()].reverse();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return router.addListener('change', ({routeState, root}) => {
      if (root) {
        if (routeState.action === 'PUSH') {
          setClassname('elux-app elux-animation elux-change ' + Date.now());
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app elux-animation';
          }, 0);
          env.setTimeout(() => {
            containerRef.current!.className = 'elux-app';
          }, 1000);
        } else if (routeState.action === 'BACK') {
          containerRef.current!.className = 'elux-app elux-animation elux-change';
          env.setTimeout(() => {
            setClassname('elux-app ' + Date.now());
          }, 1000);
        } else if (routeState.action === 'RELAUNCH') {
          setClassname('elux-app ' + Date.now());
        }
      }
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
