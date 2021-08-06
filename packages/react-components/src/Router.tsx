import React, {useContext, useEffect, useState, useRef, memo} from 'react';
import {ICoreRouter, env} from '@elux/core';
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
        }
      }
    });
  }, [router]);
  const nodes = pages.map((item) => {
    const page = item.page ? <item.page key={item.key} /> : <Page key={item.key}>{props.children}</Page>;
    return page;
  });
  return (
    <div ref={containerRef} className={classname}>
      {nodes}
    </div>
  );
};

export const Page: React.FC<{}> = memo(function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router!.getCurrentStore();
  return (
    <reactComponentsConfig.Provider store={store}>
      <div className="elux-page">{props.children}</div>
    </reactComponentsConfig.Provider>
  );
});

export function useRouter(): ICoreRouter {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  return router;
}
