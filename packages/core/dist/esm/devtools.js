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
export var devLogger = function devLogger(_ref2) {
  var id = _ref2.id,
      isActive = _ref2.isActive,
      actionName = _ref2.actionName,
      payload = _ref2.payload,
      priority = _ref2.priority,
      handers = _ref2.handers,
      state = _ref2.state,
      effect = _ref2.effect;

  if (reduxDevTools) {
    var type = ["" + id + (isActive ? '' : '*') + "|", actionName, "(" + handers.length + ")"].join('');
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