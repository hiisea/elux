import React, {ComponentType} from 'react';
import {env, IStore} from '@elux/core';
import {EluxContext, EluxContextComponent, reactComponentsConfig} from './base';
import {hydrate, render} from 'react-dom';

export function renderToDocument(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): void {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(
    <EluxContextComponent.Provider value={eluxContext}>
      <reactComponentsConfig.Provider store={store}>
        <APPView />
      </reactComponentsConfig.Provider>
    </EluxContextComponent.Provider>,
    panel
  );
}
export function renderToString(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext): Promise<string> {
  const html: string = require('react-dom/server').renderToString(
    <EluxContextComponent.Provider value={eluxContext}>
      <reactComponentsConfig.Provider store={store}>
        <APPView />
      </reactComponentsConfig.Provider>
    </EluxContextComponent.Provider>
  );
  return Promise.resolve(html);
}
