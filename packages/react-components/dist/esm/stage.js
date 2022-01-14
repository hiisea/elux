import React from 'react';
import { hydrate, render } from 'react-dom';
import { env } from '@elux/core';
import { EluxContextComponent } from './base';
import { Router } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
export function renderToMP(eluxContext) {
  var Component = function Component(_ref) {
    var children = _ref.children;
    return _jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: children
    });
  };

  return Component;
}
export function renderToDocument(id, APPView, eluxContext, fromSSR) {
  var renderFun = fromSSR ? hydrate : render;
  var panel = env.document.getElementById(id);
  renderFun(_jsx(EluxContextComponent.Provider, {
    value: eluxContext,
    children: _jsx(Router, {
      page: APPView
    })
  }), panel);
}
export function renderToString(id, APPView, eluxContext) {
  var html = require('react-dom/server').renderToString(_jsx(EluxContextComponent.Provider, {
    value: eluxContext,
    children: _jsx(Router, {
      page: APPView
    })
  }));

  return Promise.resolve(html);
}