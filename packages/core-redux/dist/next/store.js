import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export class Store {
  constructor(_redux, builder) {
    _defineProperty(this, "subscribe", void 0);

    _defineProperty(this, "getState", void 0);

    _defineProperty(this, "update", (actionName, state) => {
      this._redux.dispatch({
        type: actionName,
        state
      });
    });

    this._redux = _redux;
    this.builder = builder;
    this.getState = _redux.getState;
    this.subscribe = _redux.subscribe;
  }

  destroy() {
    return;
  }

}