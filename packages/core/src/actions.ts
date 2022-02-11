import env from './env';
import {coreConfig, LoadingState, Action, ActionHandler, CommonModel, UStore, EStore, TaskCounter, RouteState, ModuleState, RootState} from './basic';

export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：moduleName.MLoading
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：moduleName.MInit
   */
  MInit: 'Init',
  MRouteTestChange: 'RouteTestChange',
  MRouteBeforeChange: 'RouteBeforeChange',
  MRouteChange: 'RouteChange',
  Error: `Elux${coreConfig.NSP}Error`,
};

/*** @public */
export function errorAction(error: Object): Action {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}

export function routeChangeAction(routeState: RouteState): Action {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [routeState],
  };
}
export function routeBeforeChangeAction(routeState: RouteState): Action {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteBeforeChange}`,
    payload: [routeState],
  };
}
export function routeTestChangeAction(routeState: RouteState): Action {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteTestChange}`,
    payload: [routeState],
  };
}
export function moduleInitAction(moduleName: string, initState: ModuleState): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MInit}`,
    payload: [initState],
  };
}

export function moduleLoadingAction(moduleName: string, loadingState: {[group: string]: LoadingState}): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState],
  };
}

export function moduleRouteChangeAction(moduleName: string, params: RootState, action: string): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [params, action],
  };
}

/*** @public */
export function reducer(target: any, key: string, descriptor: PropertyDescriptor): any {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  // fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}

/*** @public */
export function effect(loadingKey: string | null = 'app.loading.global'): Function {
  let loadingForModuleName: string | undefined;
  let loadingForGroupName: string | undefined;
  if (loadingKey !== null) {
    [loadingForModuleName, , loadingForGroupName] = loadingKey.split('.');
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      // eslint-disable-next-line no-inner-declarations
      const injectLoading = function (this: CommonModel, curAction: Action, promiseResult: Promise<any>) {
        if (loadingForModuleName === 'app') {
          loadingForModuleName = coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }
        setLoading(this.store, promiseResult, loadingForModuleName!, loadingForGroupName!);
      };
      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([injectLoading, null]);
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}

/*** @public */
export function effectLogger(
  before: (action: Action, promiseResult: Promise<any>) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}

/*** @public */
export function setLoading<T extends Promise<any>>(store: UStore, item: T, moduleName: string, groupName: string): T {
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = (store as EStore).loadingGroups;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener((loadingState) => {
      const action = moduleLoadingAction(moduleName, {[groupName]: loadingState});
      store.dispatch(action);
    });
  }
  loadings[key].addItem(item);
  return item;
}
