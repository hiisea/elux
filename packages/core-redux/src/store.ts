import {BStore, StoreBuilder, StoreOptions, State} from '@elux/core';
import {Store as Redux, Unsubscribe} from 'redux';

export class Store<S extends State> implements BStore<S> {
  subscribe: (listener: () => void) => Unsubscribe;
  getState: () => S;
  update = (actionName: string, state: Partial<S>): void => {
    this._redux.dispatch({type: actionName, state});
  };

  constructor(protected readonly _redux: Redux, public readonly builder: StoreBuilder<StoreOptions, BStore<any>>) {
    this.getState = _redux.getState;
    this.subscribe = _redux.subscribe;
  }

  destroy(): void {
    return;
  }
}
