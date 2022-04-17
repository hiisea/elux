import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { RouterComponent } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app, store) {
    var renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    var panel = env.document.getElementById(id);
    renderFun(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {})
    }), panel);
  },
  toString: function toString(id, eluxContext, app, store) {
    var html = reactComponentsConfig.renderToString(_jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: _jsx(RouterComponent, {})
    }));
    return Promise.resolve(html);
  },
  toProvider: function toProvider(eluxContext, app, store) {
    return function (props) {
      return _jsx(EluxContextComponent.Provider, {
        value: eluxContext,
        children: props.children
      });
    };
  }
};
export default AppRender;