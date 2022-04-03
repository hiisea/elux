import { hydrate, render } from 'react-dom';
import { env, getEntryComponent } from '@elux/core';
import { renderToString } from '@elux/react-components/server';
import { EluxContextComponent } from './base';
import { RouterComponent } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
const AppRender = {
  toDocument(id, eluxContext, fromSSR, app, store) {
    const renderFun = fromSSR ? hydrate : render;
    const panel = env.document.getElementById(id);
    const appView = getEntryComponent();
    renderFun(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {
        page: appView
      })
    }), panel);
  },

  toString(id, eluxContext, app, store) {
    const appView = getEntryComponent();
    const html = renderToString(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {
        page: appView
      })
    }));
    return Promise.resolve(html);
  }

};
export default AppRender;