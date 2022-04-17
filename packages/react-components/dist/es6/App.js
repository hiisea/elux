import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { RouterComponent } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
const AppRender = {
  toDocument(id, eluxContext, fromSSR, app, store) {
    const renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    const panel = env.document.getElementById(id);
    renderFun(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {})
    }), panel);
  },

  toString(id, eluxContext, app, store) {
    const html = reactComponentsConfig.renderToString(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {})
    }));
    return Promise.resolve(html);
  },

  toProvider(eluxContext, app, store) {
    return props => _jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: props.children
    });
  }

};
export default AppRender;