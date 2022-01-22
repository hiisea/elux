/*!
 * (c) fork from https://redux.js.org/
 */
import {IFlux, State, mergeState} from './basic';
type ReduxAction<S> = {type: string; state?: Partial<S>};
type Listener = () => void;

export function createRedux<S extends State>(initState: S): IFlux<S> {
  let currentState = initState;
  let currentListeners: Listener[] | null = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState(moduleName?: string) {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing. ');
    }
    const result = moduleName ? currentState[moduleName] : currentState;
    return result as any;
  }

  function subscribe(listener: Listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }
    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }
    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ');
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  function dispatch(action: ReduxAction<S>) {
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = mergeState(currentState, action.state);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  // dispatch({type: ActionTypes.INIT});

  function update(actionName: string, state: Partial<S>): void {
    dispatch({type: actionName, state});
  }

  return {
    update,
    subscribe,
    getState,
  };
}
