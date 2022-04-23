import React, { memo } from 'react';
import { coreConfig, getEntryComponent } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export var EWindow = memo(function (_ref) {
  var store = _ref.store;
  var AppView = getEntryComponent();
  var StoreProvider = coreConfig.StoreProvider;
  return _jsx(StoreProvider, {
    store: store,
    children: _jsx(AppView, {})
  });
});