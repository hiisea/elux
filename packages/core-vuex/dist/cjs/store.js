"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Store = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var Store = function () {
  function Store(_state, builder) {
    var _this = this;

    (0, _defineProperty2.default)(this, "subscribe", function (listener) {
      return function () {
        return undefined;
      };
    });
    (0, _defineProperty2.default)(this, "getState", function () {
      return _this._state;
    });
    (0, _defineProperty2.default)(this, "update", function (actionName, state) {
      (0, _core.mergeState)(_this._state, state);
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

exports.Store = Store;