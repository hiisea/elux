import env from './env';
import {isPromise, promiseCaseCallback} from './utils';
import {actionConfig} from './action';
import {
  AsyncEluxComponent,
  baseConfig,
  EluxComponent,
  IModel,
  IModelClass,
  IModule,
  isEluxComponent,
  isEluxView,
  IStore,
  ModelAsCreators,
} from './basic';
import {ActionHandler, ActionHandlersMap, storeConfig} from './store';

export function exportModuleFacade(
  moduleName: string,
  ModelClass: IModelClass,
  components: {[componentName: string]: EluxComponent | AsyncEluxComponent},
  data?: any
): IModule {
  Object.keys(components).forEach((key) => {
    const component = components[key];
    if (
      !isEluxComponent(component) &&
      (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))
    ) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  return {
    moduleName,
    ModelClass,
    components: components as {[componentName: string]: EluxComponent},
    data,
    state: {},
    actions: {},
  };
}

export type ModuleApiMap = {[moduleName: string]: {name: string; actions: ModelAsCreators; actionNames: {[key: string]: string}}};

/**
 * 模块是否存在
 *
 * @remarks
 * 即ModuleGetter中是否有配置该模块的获取方式
 *
 * @public
 */
export function moduleExists(moduleName: string): boolean {
  return !!baseConfig.ModuleGetter![moduleName];
}

export function getModule(moduleName: string): Promise<IModule> | IModule | undefined {
  const request = baseConfig.ModuleGetter![moduleName];
  if (!request) {
    return undefined;
  }
  if (moduleConfig.ModuleCaches[moduleName]) {
    return moduleConfig.ModuleCaches[moduleName];
  }
  const moduleOrPromise = request();
  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(
      ({default: module}) => {
        injectActions(new module.ModelClass(moduleName, null as any));
        moduleConfig.ModuleCaches[moduleName] = module;
        return module;
      },
      (reason) => {
        moduleConfig.ModuleCaches[moduleName] = undefined;
        throw reason;
      }
    );
    moduleConfig.ModuleCaches[moduleName] = promiseModule;
    return promiseModule;
  }
  injectActions(new moduleOrPromise.ModelClass(moduleName, null as any));
  moduleConfig.ModuleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

export function getComponent(moduleName: string, componentName: string): Promise<EluxComponent> | EluxComponent | undefined {
  const key = [moduleName, componentName].join('.');
  if (moduleConfig.ComponentCaches[key]) {
    return moduleConfig.ComponentCaches[key];
  }
  const moduleCallback = (module: IModule) => {
    const componentOrFun = module.components[componentName];
    if (!componentOrFun) {
      return undefined;
    }
    if (isEluxComponent(componentOrFun)) {
      moduleConfig.ComponentCaches[key] = componentOrFun;
      return componentOrFun;
    }
    const promiseComponent = componentOrFun().then(
      ({default: component}) => {
        moduleConfig.ComponentCaches[key] = component;
        return component;
      },
      (reason) => {
        moduleConfig.ComponentCaches[key] = undefined;
        throw reason;
      }
    );
    moduleConfig.ComponentCaches[key] = promiseComponent;
    return promiseComponent;
  };
  const moduleOrPromise = getModule(moduleName);
  if (!moduleOrPromise) {
    return undefined;
  }
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then((module) => {
      const component = moduleCallback(module);
      if (component) {
        return component;
      }
      throw `Not found ${key}`;
    });
  }
  return moduleCallback(moduleOrPromise);
}

export function getEntryComponent(): EluxComponent {
  return getComponent(actionConfig.StageModuleName, baseConfig.StageViewName) as EluxComponent;
}

export function getModuleApiMap(data?: {[moduleName: string]: string[]}): ModuleApiMap {
  if (!moduleConfig.ModuleApiMap) {
    if (data) {
      moduleConfig.ModuleApiMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions: Record<string, any> = {};
        const actionNames: Record<string, string> = {};
        arr.forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + actionConfig.NSP + actionName, payload});
          actionNames[actionName] = moduleName + actionConfig.NSP + actionName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as ModuleApiMap);
    } else {
      const cacheData = {};
      moduleConfig.ModuleApiMap = new Proxy(
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
                      return moduleName + actionConfig.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + actionConfig.NSP + actionName, payload});
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
  return moduleConfig.ModuleApiMap;
}

/**
 * 动态注册Module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export function injectModule(module: IModule): void;
/**
 * 动态注册module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export function injectModule(moduleName: string, moduleGetter: () => IModule | Promise<{default: IModule}>): void;
export function injectModule(moduleOrName: string | IModule, moduleGetter?: () => IModule | Promise<{default: IModule}>): void {
  if (typeof moduleOrName === 'string') {
    baseConfig.ModuleGetter![moduleOrName] = moduleGetter!;
  } else {
    baseConfig.ModuleGetter![moduleOrName.moduleName] = () => moduleOrName;
  }
}

export function loadComponent(moduleName: string, componentName: string, store: IStore): Promise<EluxComponent> | EluxComponent | undefined {
  const componentOrPromise = getComponent(moduleName, componentName);
  if (!componentOrPromise) {
    return undefined;
  }
  return promiseCaseCallback(componentOrPromise, (component) => {
    if (!env.isServer && isEluxView(component)) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), () => component);
    }
    return component;
  });
}

export function injectActions(model: IModel, hmr?: boolean): void {
  const moduleName = model.moduleName;
  const handlers: {[key: string]: ActionHandler} = model as any;
  // eslint-disable-next-line no-restricted-syntax
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(',').forEach((actionName) => {
          actionName = actionName.trim();
          if (actionName) {
            actionName = actionName.replace(new RegExp(`^this[${actionConfig.NSP}]`), `${moduleName}${actionConfig.NSP}`);
            const arr = actionName.split(actionConfig.NSP);
            if (arr[1]) {
              // handler.__isHandler__ = true;
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap, hmr);
            } else {
              // handler.__isHandler__ = false;
              transformAction(
                moduleName + actionConfig.NSP + actionName,
                handler,
                moduleName,
                handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap,
                hmr
              );
              // addModuleActionCreatorList(moduleName, actionName);
            }
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
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

baseConfig.GetModule = getModule;

export const moduleConfig: {
  ModuleCaches: {[moduleName: string]: undefined | IModule | Promise<IModule>};
  ComponentCaches: {[moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>};
  ModuleApiMap: ModuleApiMap;
} = {
  ModuleCaches: {},
  ComponentCaches: {},
  ModuleApiMap: null as any,
};
