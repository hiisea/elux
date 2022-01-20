"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.devLogger = void 0;

var _env = _interopRequireDefault(require("./env"));

var reduxDevTools;

if (process.env.NODE_ENV === 'development' && _env.default.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = _env.default.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(function (_ref) {
    var type = _ref.type,
        payload = _ref.payload;

    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

var effects = [];

var devLogger = function devLogger(_ref2, actionName, payload, priority, handers, state, effectStatus) {
  var id = _ref2.id,
      isActive = _ref2.isActive;

  if (reduxDevTools) {
    var flag = effectStatus === 'start' ? '+' : effectStatus === 'end' ? '-' : '';
    var type = [flag, actionName, " (" + (isActive ? '' : '*') + id + ")"].join('');
    var _logItem = {
      type: type,
      payload: payload,
      priority: priority,
      handers: handers
    };

    if (flag) {
      effects.push(_logItem);
    } else {
      _logItem.effects = [].concat(effects);
      effects.length = 0;
      reduxDevTools.send(_logItem, state);
    }
  }
};

exports.devLogger = devLogger;