import env from './env';
import {IStoreLogger} from './basic';

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

export const devLogger: IStoreLogger = (
  {id, isActive}: {id: number; isActive: boolean},
  actionName: string,
  payload: any[],
  priority: string[],
  handers: string[],
  state: object,
  effect: boolean
): void => {
  if (reduxDevTools) {
    const type = [actionName, ` (${isActive ? '' : '*'}${id})`].join('');
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
