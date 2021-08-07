import {IStore, ICoreRouter, exportModule} from '@elux/core';

export const messages: any[] = [];

class RouteModuleHandler {
  initState = {};
  constructor(public moduleName: string, public store: IStore) {}
  destroy() {
    return;
  }
}

export const routerModule = exportModule('route', RouteModuleHandler, {}, {});
export class Router implements ICoreRouter {
  store!: IStore;
  init(store: IStore): void {
    this.store = store;
  }
  getCurrentStore(): IStore {
    return this.store;
  }
  getParams(): Record<string, any> {
    return {};
  }
}

export const router = new Router();
