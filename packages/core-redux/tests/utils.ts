import {IStore, ICoreRouter, exportModule, RouteModuleHandlers} from '@elux/core';

export const messages: any[] = [];

export const routerModule = exportModule('route', RouteModuleHandlers, {}, {});
export class Router implements ICoreRouter {
  name = 'route';
  store!: IStore;
  latestState = {};
  routeState = {action: '', params: {}};
  startup(store: IStore): void {
    this.store = store;
  }
  getCurrentStore(): IStore {
    return this.store;
  }
  getStoreList(): IStore[] {
    return [this.store];
  }
}

export const router = new Router();
