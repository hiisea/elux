import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { mergeState } from '@elux/core';
export var Store = function () {
  function Store(_state, builder) {
    var _this = this;

    _defineProperty(this, "subscribe", function (listener) {
      return function () {
        return undefined;
      };
    });

    _defineProperty(this, "getState", function () {
      return _this._state;
    });

    _defineProperty(this, "update", function (actionName, state) {
      mergeState(_this._state, state);
    });

    this._state = _state;
    this.builder = builder;
  }

  var _proto = Store.prototype;

  _proto.destroy = function destroy() {
    return;
  };

  return Store;
}();