import React from 'react';
import { hydrate, render } from 'react-dom';
import { env } from '@elux/core';
import { EluxContextComponent } from './base';
import { Router } from './Router';
import { jsx as _jsx } from "react/jsx-runtime";
export function renderToMP(eluxContext) {
  const Component = ({
    children
  }) => _jsx(EluxContextComponent.Provider, {
    value: eluxContext,
    children: children
  });

  return Component;
}
export function renderToDocument(id, APPView, eluxContext, fromSSR) {
  const renderFun = fromSSR ? hydrate : render;
  const panel = env.document.getElementById(id);
  renderFun(_jsx(EluxContextComponent.Provider, {
    value: eluxContext,
    children: _jsx(Router, {
      page: APPView
    })
  }), panel);
}
export function renderToString(id, APPView, eluxContext) {
  const html = require('react-dom/server').renderToString(_jsx(EluxContextComponent.Provider, {
    value: eluxContext,
    children: _jsx(Router, {
      page: APPView
    })
  }));

  return Promise.resolve(html);
}