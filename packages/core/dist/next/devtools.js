import env from './env';
let reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(({
    type,
    payload
  }) => {
    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

const effects = [];
export const devLogger = ({
  id,
  isActive
}, actionName, payload, priority, handers, state, effectStatus) => {
  if (reduxDevTools) {
    const flag = effectStatus === 'start' ? '+' : effectStatus === 'end' ? '-' : '';
    const type = [flag, actionName, ` (${isActive ? '' : '*'}${id})`].join('');
    const logItem = {
      type,
      payload,
      priority,
      handers
    };

    if (flag) {
      effects.push(logItem);
    } else {
      logItem.effects = [...effects];
      effects.length = 0;
      reduxDevTools.send(logItem, state);
    }
  }
};