import { env } from './env';
import { TaskCounter, deepMerge, warn } from './sprite';
export const config = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2
};
export function setConfig(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}
export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: `Elux${config.NSP}Error`
};
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}
export function moduleReInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
    payload: [initState]
  };
}
export function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState]
  };
}
export function isEluxComponent(data) {
  return data['__elux_component__'];
}
export const MetaData = {
  appModuleName: 'stage',
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null,
  clientStore: null,
  moduleGetter: null
};

function transformAction(actionName, handler, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate or conflict : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName, handlers) {
  const injectedModules = MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(config.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);

          if (arr[1]) {
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
          } else {
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
          }
        });
      }
    }
  }
}
const loadings = {};
export function setLoading(store, item, moduleName, groupName) {
  const key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(config.DepthTimeOnLoading);
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
export function effect(loadingKey = 'app.loading.global') {
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

    if (loadingForModuleName && loadingForGroupName) {
      const before = (curAction, moduleName, promiseResult) => {
        if (!env.isServer) {
          if (loadingForModuleName === 'app') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (loadingForModuleName === 'this') {
            loadingForModuleName = moduleName;
          }

          setLoading(MetaData.clientStore, promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
export const mutation = reducer;
export const action = effect;
export function logger(before, after) {
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
export function deepMergeState(target = {}, ...args) {
  if (config.MutableData) {
    return deepMerge(target, ...args);
  }

  return deepMerge({}, target, ...args);
}
export function mergeState(target = {}, ...args) {
  if (config.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
}