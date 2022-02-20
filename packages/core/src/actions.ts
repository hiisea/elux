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

/**
 * 创建一个ErrorAction
 *
 * @remarks
 * action.type 为 `Elux.Error`
 *
 * @param error - error报文
 *
 * @returns
 * 返回一个 type 为 `Elux.Error` 的 action
 *
 * @public
 */
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

/**
 * Model Decorator函数-申明reducer
 *
 * @remarks
 * 申明以下方法为一个 action reducer
 *
 * @public
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
 * Model Decorator函数-申明effect
 *
 * @remarks
 * 申明以下方法为一个 action effect，
 * 参数 `loadingKey` 不传时默认为 stage.loading.global，
 * 如果不需要跟踪其执行状态，请使用 null 参数，如：`@effect(null)`
 *
 * @example
 * - `@effect('this.loading.searchTable')` 将该 effect 执行状态注入本模块的 `loading.searchTable` 状态中
 *
 * - `@effect()` 等于 `@effect('stage.loading.global')`
 *
 * - `@effect(null)` 不跟踪其执行状态
 *
 * @param loadingKey - 将该 effect 执行状态作为 {@link LoadingState | LoadingState} 注入指定的 ModuleState 中。
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
export function effect(loadingKey: string | null = 'stage.loading.global'): Function {
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
        if (loadingForModuleName === 'stage') {
          loadingForModuleName = coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }
        setLoading(promiseResult, this.store, loadingForModuleName!, loadingForGroupName!);
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
 * Model Decorator函数-申明effect执行钩子
 *
 * @remarks
 * 用于在以下 effect 中注入 before 和 after 的钩子，常用来跟踪effect执行情况
 *
 * @param before - 该 effect 执行前自动调用
 * @param after - 该 effect 执行后自动调用（无论成功与否）
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
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

/**
 * 将{@link LoadingState | LoadingState}注入指定ModuleState
 *
 * @param item - 要跟踪的异步任务，必须是一个Promise
 * @param store - 指明注入哪一个Store中
 * @param moduleName - 指明注入哪一个Modulde状态中
 * @param groupName - 指明注入Modulde状态的loading[`groupName`]中
 *
 * @returns
 * 返回第一个入参
 *
 * @public
 */
export function setLoading<T extends Promise<any>>(item: T, store: UStore, moduleName: string, groupName: string): T {
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
