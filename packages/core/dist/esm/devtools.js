import env from './env';
var reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
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
export var devLogger = function devLogger(_ref2, actionName, payload, priority, handers, state, effect) {
  var id = _ref2.id,
      isActive = _ref2.isActive;

  if (reduxDevTools) {
    var type = [actionName, " (" + (isActive ? '' : '*') + id + ")"].join('');
    var _logItem = {
      type: type,
      payload: payload,
      priority: priority,
      handers: handers
    };

    if (effect) {
      effects.push(_logItem);
    } else {
      _logItem.effects = [].concat(effects);
      effects.length = 0;
      reduxDevTools.send(_logItem, state);
    }
  }
};