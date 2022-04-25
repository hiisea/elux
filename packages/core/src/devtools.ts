import {StoreLogger} from './basic';
import env from './env';

type LogItem = {type: string; payload: any[]; priority: string[]; handers: string[]; effects?: LogItem[]};

let reduxDevTools:
  | {
      init(state: any): void;
      subscribe(action: any): void;
      send(logItem: LogItem, state: any): void;
    }
  | undefined;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({features: {}});
  reduxDevTools.init({});
  reduxDevTools.subscribe(({type, payload}: {type: string; payload: {type: string}}) => {
    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools!.init({});
    }
  });
}

const effects: LogItem[] = [];

export const devLogger: StoreLogger = ({id, isActive, actionName, payload, priority, handers, state, effect}): void => {
  if (reduxDevTools) {
    const type = [`${id}${isActive ? '' : '*'}|`, actionName, `(${handers.length})`].join('');
    const logItem: LogItem = {type, payload, priority, handers};
    if (effect) {
      effects.push(logItem);
    } else {
      logItem.effects = [...effects];
      effects.length = 0;
      reduxDevTools.send(logItem, state);
    }
  }
};
