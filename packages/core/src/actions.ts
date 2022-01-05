import env from './env';
import {Action, coreConfig, IStore, ActionHandler, IModuleHandlers} from './basic';
import {TaskCounter, LoadingState} from './sprite';

/**
 * @internal
 */
export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：moduleName.MLoading
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：moduleName.MInit
   */
  MInit: 'Init',
  /**
   * 模块初始化时使用ActionType：moduleName.MReInit
   */
  MReInit: 'ReInit',
  MRouteChange: 'RouteChange',
  Error: `Elux${coreConfig.NSP}Error`,
};

/**
 * @internal
 */
export function errorAction(error: Object): Action {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}
export function routeChangeAction(routeState: Record<string, any>): Action {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [routeState],
  };
}
export function moduleInitAction(moduleName: string, initState: Record<string, any>): Action {
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
export function moduleRouteChangeAction(moduleName: string, params: Record<string, any>, action: string): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [params, action],
  };
}
/**
 * @internal
 */
export function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string): T {
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = store.loadingGroups;
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

/**
 * @internal
 */
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

/**
 * @internal
 */
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
      const injectLoading = function (this: IModuleHandlers, curAction: Action, promiseResult: Promise<any>) {
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

/**
 * @internal
 */
export const mutation = reducer;

/**
 * @internal
 */
export const action = effect;

/**
 * @internal
 */
export function logger(
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
