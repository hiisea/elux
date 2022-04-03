import { hydrate, render } from 'react-dom';
import { env, getEntryComponent } from '@elux/core';
import { renderToString } from '@elux/react-components/server';
import { EluxContextComponent } from './base';
import { RouterComponent } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app, store) {
    var renderFun = fromSSR ? hydrate : render;
    var panel = env.document.getElementById(id);
    var appView = getEntryComponent();
    renderFun(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {
        page: appView
      })
    }), panel);
  },
  toString: function toString(id, eluxContext, app, store) {
    var appView = getEntryComponent();
    var html = renderToString(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {
        page: appView
      })
    }));
    return Promise.resolve(html);
  }
};
export default AppRender;