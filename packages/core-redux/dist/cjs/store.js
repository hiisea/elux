"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Store = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Store = function () {
  function Store(_redux, builder) {
    var _this = this;

    (0, _defineProperty2.default)(this, "subscribe", void 0);
    (0, _defineProperty2.default)(this, "getState", void 0);
    (0, _defineProperty2.default)(this, "update", function (actionName, state) {
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

exports.Store = Store;