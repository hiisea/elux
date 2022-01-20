import {mergeState, BStore, StoreBuilder, StoreOptions, State} from '@elux/core';

export class Store<S extends State> implements BStore<S> {
  subscribe = (listener: () => void) => {
    return (): void => undefined;
  };
  getState = (): S => {
    return this._state;
  };

  update = (actionName: string, state: Partial<S>): void => {
    mergeState(this._state, state);
  };

  constructor(protected readonly _state: S, public readonly builder: StoreBuilder<StoreOptions, BStore<any>>) {}

  destroy(): void {
    return;
  }
}
