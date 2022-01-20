import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var Store = function () {
  function Store(_redux, builder) {
    var _this = this;

    _defineProperty(this, "subscribe", void 0);

    _defineProperty(this, "getState", void 0);

    _defineProperty(this, "update", function (actionName, state) {
      _this._redux.dispatch({
        type: actionName,
        state: state
      });
    });

    this._redux = _redux;
    this.builder = builder;
    this.getState = _redux.getState;
    this.subscribe = _redux.subscribe;
  }

  var _proto = Store.prototype;

  _proto.destroy = function destroy() {
    return;
  };

  return Store;
}();