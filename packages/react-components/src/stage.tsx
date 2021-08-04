import React, {ComponentType, useContext, useEffect, useState} from 'react';
import {env, IStore} from '@elux/core';
import {EluxContext, EluxContextComponent, reactComponentsConfig} from './base';
import {hydrate, render} from 'react-dom';

export const Router: React.FC = (props) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const [pages, setPages] = useState(router.getHistory(true).getPages());
  useEffect(() => {
    return router.addListener(({routeState, root}) => {
      if (root && (routeState.action === 'PUSH' || routeState.action === 'BACK')) {
        const newPages = router.getHistory(true).getPages();
        setPages(newPages);
      }
    });
  }, [router]);
  const nodes = pages.map((item) => {
    const page = <item.page key={item.pagename} /> || <Page key={item.pagename}>{props.children}</Page>;
    return page;
  });
  return <>{nodes}</>;
};

export const Page: React.FC<{}> = function (props) {
  const eluxContext = useContext(EluxContextComponent);
  const store = eluxContext.router!.getCurrentStore();
  return (
    <reactComponentsConfig.Provider store={store}>
      <div className="elux-page">{props.children}</div>
    </reactComponentsConfig.Provider>
  );
};

export function renderToMP(store: IStore, eluxContext: EluxContext): ComponentType<any> {
  const Component: React.FC = ({children}) => <EluxContextComponent.Provider value={eluxContext}>{children}</EluxContextComponent.Provider>;
  return Component;
}

export function renderToDocument(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): void {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(
    <EluxContextComponent.Provider value={eluxContext}>
      <Router>
        <APPView />
      </Router>
    </EluxContextComponent.Provider>,
    panel
  );
}
export function renderToString(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext): Promise<string> {
  const html: string = require('react-dom/server').renderToString(
    <EluxContextComponent.Provider value={eluxContext}>
      <Router>
        <APPView />
      </Router>
    </EluxContextComponent.Provider>
  );
  return Promise.resolve(html);
}
