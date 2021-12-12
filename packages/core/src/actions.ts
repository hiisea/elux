import env from './env';
import {Action, coreConfig, IStore, ActionHandler, IModuleHandlers} from './basic';
import {TaskCounter, LoadingState} from './sprite';
/**
 * 框架内置的几个ActionTypes
 */
export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：{moduleName}.{MLoading}
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MInit}
   */
  MInit: 'Init',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MReInit}
   */
  MReInit: 'ReInit',
  MRouteChange: 'RouteChange',
  Error: `Elux${coreConfig.NSP}Error`,
};
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
 * 手动设置Loading状态，同一个key名的loading状态将自动合并
 * - 参见LoadingState
 * @param item 一个Promise加载项
 * @param moduleName moduleName+groupName合起来作为该加载项的key
 * @param groupName moduleName+groupName合起来作为该加载项的key
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
 * 一个类方法的装饰器，用来指示该方法为一个effectHandler
 * - effectHandler必须通过dispatch Action来触发
 * @param loadingKey 注入加载状态到state，如果为null表示不注入加载状态，默认为'app.loading.global'
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
export const mutation = reducer;
export const action = effect;
/**
 * 一个类方法的装饰器，用来向effect中注入before和after的钩子
 * - 注意不管该handler是否执行成功，前后钩子都会强制执行
 * @param before actionHandler执行前的钩子
 * @param after actionHandler执行后的钩子
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
