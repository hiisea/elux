import React, {useContext, useEffect, useState, useRef, memo} from 'react';
import {EluxContextComponent, reactComponentsConfig} from './base';

export const Router: React.FC = (props) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const [pages, setPages] = useState(router.getHistory(true).getPages());
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return router.addListener(({routeState, root}) => {
      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        const newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  useEffect(() => {
    containerRef.current!.className = 'elux-app';
  });
  const nodes = pages.reverse().map((item) => {
    const page = item.page ? <item.page key={item.key} /> : <Page key={item.key}>{props.children}</Page>;
    return page;
  });
  return (
    <div ref={containerRef} className="elux-app elux-enter">
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
