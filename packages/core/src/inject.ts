import {
  ActionHandler,
  ActionHandlersMap,
  AsyncEluxComponent,
  CommonModel,
  CommonModule,
  coreConfig,
  EluxComponent,
  isEluxComponent,
  IStore,
  MetaData,
  ModelAsHandlers,
  ModuleApiMap,
} from './basic';
import env from './env';
import {isPromise, promiseCaseCallback} from './utils';

/**
 * 获取Module
 *
 * @remarks
 * 获取通过 {@link exportModule} 导出的 Module
 *
 * @public
 */
export function getModule(moduleName: string): Promise<CommonModule> | CommonModule {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName]!;
  }
  const moduleOrPromise = coreConfig.ModuleGetter[moduleName]();
  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(
      ({default: module}) => {
        injectActions(new module.ModelClass(moduleName, null as any));
        MetaData.moduleCaches[moduleName] = module;
        return module;
      },
      (reason) => {
        MetaData.moduleCaches[moduleName] = undefined;
        throw reason;
      }
    );
    MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }
  injectActions(new moduleOrPromise.ModelClass(moduleName, null as any));
  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

/**
 * 获取导出的UI组件
 *
 * @remarks
 * 获取通过 {@link exportModule} 导出的 Component。与 {@link ILoadComponent} 不同的是本方法只获取 Component 构造器，并不会render
 *
 * @public
 */
export function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent> {
  const key = [moduleName, componentName].join(coreConfig.NSP);
  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key]!;
  }
  const moduleCallback = (module: CommonModule) => {
    const componentOrFun = module.components[componentName] as EluxComponent | AsyncEluxComponent;
    if (isEluxComponent(componentOrFun)) {
      MetaData.componentCaches[key] = componentOrFun;
      return componentOrFun;
    }
    const promiseComponent = componentOrFun().then(
      ({default: component}) => {
        MetaData.componentCaches[key] = component;
        return component;
      },
      (reason) => {
        MetaData.componentCaches[key] = undefined;
        throw reason;
      }
    );
    MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };
  const moduleOrPromise = getModule(moduleName);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }
  return moduleCallback(moduleOrPromise);
}

export function getEntryComponent(): EluxComponent {
  return getComponent(coreConfig.StageModuleName, coreConfig.StageViewName) as EluxComponent;
}

export function getModuleApiMap(data?: Record<string, string[]>): ModuleApiMap {
  if (!MetaData.moduleApiMap) {
    if (data) {
      MetaData.moduleApiMap = Object.keys(data).reduce((prev, moduleName) => {
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
      }, {} as ModuleApiMap);
    } else {
      const cacheData = {};
      MetaData.moduleApiMap = new Proxy(
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
  return MetaData.moduleApiMap;
}

/**
 * 动态注册module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export function injectModule(module: CommonModule): void;
/**
 * 动态注册module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export function injectModule(moduleName: string, moduleGetter: () => CommonModule | Promise<{default: CommonModule}>): void;
export function injectModule(moduleOrName: string | CommonModule, moduleGetter?: () => CommonModule | Promise<{default: CommonModule}>): void {
  if (typeof moduleOrName === 'string') {
    coreConfig.ModuleGetter[moduleOrName] = moduleGetter!;
  } else {
    coreConfig.ModuleGetter[moduleOrName.moduleName] = () => moduleOrName;
  }
}

export function injectComponent(moduleName: string, componentName: string, store: IStore): EluxComponent | Promise<EluxComponent> {
  return promiseCaseCallback(getComponent(moduleName, componentName), (component) => {
    if (component.__elux_component__ === 'view' && !env.isServer) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), () => component);
    }
    return component;
  });
}

export function injectActions(model: CommonModel, hmr?: boolean): void {
  const moduleName = model.moduleName;
  const handlers: ModelAsHandlers = model as any;
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

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlersMap, hmr?: boolean) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn(`Action duplicate : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}
