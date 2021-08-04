import React, {ComponentType} from 'react';
import {hydrate, render} from 'react-dom';
import {env, IStore} from '@elux/core';
import {EluxContext, EluxContextComponent} from './base';
import {Router} from './Router';

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
