import env from './env';
import {deepClone} from './utils';
import {
  coreConfig,
  mergeState,
  CommonModelClass,
  EluxComponent,
  AsyncEluxComponent,
  UStore,
  EStore,
  RouteState,
  isEluxComponent,
  MetaData,
  ModelAsHandlers,
  ActionHandler,
  ActionHandlersMap,
  RootState,
  ModuleMap,
  ModuleState,
  CommonModule,
  CommonModel,
} from './basic';
import {ActionTypes, moduleInitAction, reducer} from './actions';

function initModel(moduleName: string, ModelClass: CommonModelClass, _store: UStore) {
  const store = _store as EStore;
  if (!store.injectedModules[moduleName]) {
    const {latestState} = store.router;
    const preState = store.getState();
    const model = new ModelClass(moduleName, store);
    const initState = model.init(latestState, preState) || {};
    store.injectedModules[moduleName] = model;
    return store.dispatch(moduleInitAction(moduleName, coreConfig.MutableData ? deepClone(initState) : initState));
  }
  return undefined;
}

export function exportModule(
  moduleName: string,
  ModelClass: CommonModelClass,
  components: {[componentName: string]: EluxComponent | AsyncEluxComponent},
  data?: any
): CommonModule {
  Object.keys(components).forEach((key) => {
    const component = components[key];
    if (
      !isEluxComponent(component) &&
      (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))
    ) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  const model = new ModelClass(moduleName, null as any);
  injectActions(moduleName, model);
  return {
    moduleName,
    initModel: initModel.bind(null, moduleName, ModelClass),
    state: {},
    actions: {},
    components,
    routeParams: model.defaultRouteParams,
    data,
  };
}

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlersMap, hmr?: boolean) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn(`Action duplicate : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName: string, model: CommonModel, hmr?: boolean): void {
  const handlers: ModelAsHandlers = model as any;
  const injectedModules = MetaData.injectedModules;
  if (injectedModules[moduleName]) {
    return;
  }
  injectedModules[moduleName] = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(coreConfig.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
          const arr = actionName.split(coreConfig.NSP);
          if (arr[1]) {
            // handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          } else {
            // handler.__isHandler__ = false;
            transformAction(
              moduleName + coreConfig.NSP + actionName,
              handler,
              moduleName,
              handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap,
              hmr
            );
            // addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
}

/*** @public */
export function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void {
  const moduleCache = MetaData.moduleCaches[moduleName];
  if (moduleCache && moduleCache['initModel']) {
    (moduleCache as CommonModule<string, EStore>).initModel = initModel.bind(null, moduleName, ModelClass);
  }
  //const store = MetaData.currentRouter.getCurrentStore();
  if (MetaData.injectedModules[moduleName]) {
    MetaData.injectedModules[moduleName] = false;
    const model = new ModelClass(moduleName, null as any);
    injectActions(moduleName, model, true);
  }
  const stores = MetaData.currentRouter.getStoreList();
  stores.forEach((store) => {
    if (store.injectedModules[moduleName]) {
      const model = new ModelClass(moduleName, store);
      store.injectedModules[moduleName] = model;
    }
  });
  env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
}

export function getModuleMap(data?: Record<string, string[]>): ModuleMap {
  if (!MetaData.moduleMap) {
    if (data) {
      MetaData.moduleMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions: Record<string, any> = {};
        const actionNames: Record<string, string> = {};
        arr.forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + coreConfig.NSP + actionName, payload});
          actionNames[actionName] = moduleName + coreConfig.NSP + actionName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as ModuleMap);
    } else {
      const cacheData = {};
      MetaData.moduleMap = new Proxy(
        {},
        {
          set(target, moduleName: string, val, receiver) {
            return Reflect.set(target, moduleName, val, receiver);
          },
          get(target, moduleName: string, receiver) {
            const val = Reflect.get(target, moduleName, receiver);
            if (val !== undefined) {
              return val;
            }
            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
                actionNames: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return moduleName + coreConfig.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + coreConfig.NSP + actionName, payload});
                    },
                  }
                ),
              };
            }
            return cacheData[moduleName];
          },
        }
      );
    }
  }
  return MetaData.moduleMap;
}

/*** @public */
export function exportComponent<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}

/*** @public */
export function exportView<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}

/*** @public */
export class EmptyModel implements CommonModel {
  initState: any = {};
  defaultRouteParams: any = {};
  constructor(public readonly moduleName: string, public readonly store: UStore) {}
  init(): ModuleState {
    return {};
  }
  destroy(): void {
    return;
  }
}

/*** @public */
export class RouteModel implements CommonModel {
  defaultRouteParams: ModuleState = {};
  constructor(public readonly moduleName: string, public readonly store: UStore) {}
  init(latestState: RootState, preState: RootState): RouteState {
    return preState[this.moduleName] as RouteState;
  }

  @reducer
  public [ActionTypes.MInit](initState: RouteState): RouteState {
    return initState;
  }
  @reducer
  public [ActionTypes.MRouteChange](routeState: RouteState): RouteState {
    return mergeState(this.store.getState(this.moduleName), routeState);
  }
  public destroy(): void {
    return;
  }
}
