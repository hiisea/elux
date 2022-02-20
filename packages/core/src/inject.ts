import env from './env';
import {isPromise} from './utils';
import {MetaData, CommonModule, EluxComponent, coreConfig, isEluxComponent, ModuleGetter, UStore, EStore} from './basic';

/**
 * 获取导出的Module
 *
 * @remarks
 * {@link exportModule | exportModule(...)} 导出的 Module，可以通过此方法获得，返回结果有可能是一个Promise
 *
 * @param moduleName - 要获取的模块名
 *
 * @public
 */
export function getModule(moduleName: string): Promise<CommonModule> | CommonModule {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName]!;
  }
  const moduleOrPromise = MetaData.moduleGetter[moduleName]();
  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(
      ({default: module}) => {
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
  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

export function getModuleList(moduleNames: string[]): CommonModule[] | Promise<CommonModule[]> {
  if (moduleNames.length < 1) {
    return [];
  }
  const list = moduleNames.map((moduleName) => {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName]!;
    }
    return getModule(moduleName);
  });
  if (list.some((item) => isPromise(item))) {
    return Promise.all(list);
  } else {
    return list as CommonModule[];
  }
}

/**
 * 获取Module导出的EluxUI组件
 *
 * @remarks
 * {@link exportModule | exportModule(...)} 导出的 Component，可以通过此方法获得。
 *
 * - 与 {@link LoadComponent} 不同的是本方法只获取 Component 构造器，并不会实例化和Install
 *
 * - 返回结果有可能是一个Promise
 *
 * @param moduleName - 组件所属模块名
 * @param componentName - 组件被导出的名称
 *
 * @public
 */
export function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent> {
  const key = [moduleName, componentName].join(coreConfig.NSP);
  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key]!;
  }
  const moduleCallback = (module: CommonModule) => {
    const componentOrFun = module.components[componentName];
    if (isEluxComponent(componentOrFun)) {
      const component = componentOrFun;
      MetaData.componentCaches[key] = component;
      return component;
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

export function getComponentList(keys: string[]): Promise<EluxComponent[]> {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }
  return Promise.all(
    keys.map((key) => {
      if (MetaData.componentCaches[key]) {
        return MetaData.componentCaches[key]!;
      }
      const [moduleName, componentName] = key.split(coreConfig.NSP);
      return getComponent(moduleName, componentName);
    })
  );
}

/**
 * 手动加载并初始化一个Model
 *
 * @remarks
 * 通常情况下无需手动加载，因为以下2种情况都将自动加载：
 *
 * - {@link Dispatch} 一个 ModuleA.xxxAction 时，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
 *
 * - UI Render一个通过 {@link LoadComponent} 加载的ModuleA-UI组件，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
 *
 * @param moduleName - 要加载的 module 名称
 * @param store - 要注册该 Model 的 Store
 *
 * @public
 */
export function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: UStore): void | Promise<void> {
  const moduleOrPromise = getModule(moduleName as string);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then((module) => module.initModel(store as EStore));
  }
  return moduleOrPromise.initModel(store as EStore);
}

export function loadComponent(
  moduleName: string,
  componentName: string,
  store: EStore,
  deps: Record<string, boolean>
): EluxComponent | null | Promise<EluxComponent | null> {
  const promiseOrComponent = getComponent(moduleName, componentName);
  const callback = (component: EluxComponent) => {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (env.isServer) {
        return null;
      }
      const module = getModule(moduleName) as CommonModule;
      module.initModel(store);
    }
    deps[moduleName + coreConfig.NSP + componentName] = true;
    return component;
  };
  if (isPromise(promiseOrComponent)) {
    if (env.isServer) {
      return null;
    }
    return promiseOrComponent.then(callback);
  }
  return callback(promiseOrComponent);
}

export function moduleExists(): {[moduleName: string]: boolean} {
  return MetaData.moduleExists;
}
export function getCachedModules(): {[moduleName: string]: undefined | CommonModule | Promise<CommonModule>} {
  return MetaData.moduleCaches;
}

export function defineModuleGetter(moduleGetter: ModuleGetter): void {
  MetaData.moduleGetter = moduleGetter;
  MetaData.moduleExists = Object.keys(moduleGetter).reduce((data, moduleName) => {
    data[moduleName] = true;
    return data;
  }, {});
}
