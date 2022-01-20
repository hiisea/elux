import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { mergeState } from '@elux/core';
export class Store {
  constructor(_state, builder) {
    _defineProperty(this, "subscribe", listener => {
      return () => undefined;
    });

    _defineProperty(this, "getState", () => {
      return this._state;
    });

    _defineProperty(this, "update", (actionName, state) => {
      mergeState(this._state, state);
    });

    this._state = _state;
    this.builder = builder;
  }

  destroy() {
    return;
  }

}