import React, {ComponentType} from 'react';
import {hydrate, render} from 'react-dom';
import {env, UStore} from '@elux/core';
import {EluxContext, EluxContextComponent} from './base';
import {Router} from './Router';

export function renderToMP(eluxContext: EluxContext): ComponentType<any> {
  const Component: React.FC = ({children}) => <EluxContextComponent.Provider value={eluxContext}>{children}</EluxContextComponent.Provider>;
  return Component;
}

export function renderToDocument(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, fromSSR: boolean, app: {}, store: UStore): void {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(
    <EluxContextComponent.Provider value={eluxContext}>
      <Router page={APPView} />
    </EluxContextComponent.Provider>,
    panel
  );
}
export function renderToString(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, app: {}, store: UStore): Promise<string> {
  const html: string = require('react-dom/server').renderToString(
    <EluxContextComponent.Provider value={eluxContext}>
      <Router page={APPView} />
    </EluxContextComponent.Provider>
  );
  return Promise.resolve(html);
}
