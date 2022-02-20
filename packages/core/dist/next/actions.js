import env from './env';
import { coreConfig, TaskCounter } from './basic';
export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteTestChange: 'RouteTestChange',
  MRouteBeforeChange: 'RouteBeforeChange',
  MRouteChange: 'RouteChange',
  Error: `Elux${coreConfig.NSP}Error`
};
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [routeState]
  };
}
export function routeBeforeChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteBeforeChange}`,
    payload: [routeState]
  };
}
export function routeTestChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteTestChange}`,
    payload: [routeState]
  };
}
export function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}
export function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState]
  };
}
export function moduleRouteChangeAction(moduleName, params, action) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [params, action]
  };
}
export function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  const fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
export function effect(loadingKey = 'stage.loading.global') {
  let loadingForModuleName;
  let loadingForGroupName;

  if (loadingKey !== null) {
    [loadingForModuleName,, loadingForGroupName] = loadingKey.split('.');
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      const injectLoading = function (curAction, promiseResult) {
        if (loadingForModuleName === 'stage') {
          loadingForModuleName = coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(promiseResult, this.store, loadingForModuleName, loadingForGroupName);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
export function effectLogger(before, after) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
export function setLoading(item, store, moduleName, groupName) {
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(loadingState => {
      const action = moduleLoadingAction(moduleName, {
        [groupName]: loadingState
      });
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}