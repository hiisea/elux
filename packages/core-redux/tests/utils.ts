import {IStore, ICoreRouter} from '@elux/core';

export const messages: any[] = [];

export class Router implements ICoreRouter {
  injectedModules = {};
  store!: IStore;
  init(store: IStore): void {
    this.store = store;
  }
  getCurrentStore(): IStore {
    return this.store;
  }
}

export const router = new Router();
