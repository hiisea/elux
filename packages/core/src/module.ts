import env from './env';
import {TaskCounter} from './utils';
import {
  Action,
  ActionHandler,
  CommonModel,
  CommonModelClass,
  CommonModule,
  EluxComponent,
  MetaData,
  AsyncEluxComponent,
  isEluxComponent,
  ModuleState,
  IStore,
  coreConfig,
} from './basic';
import {moduleLoadingAction} from './actions';

/**
 * 向外导出一个EluxUI组件
 *
 * @remarks
 * 不同于普通UI组件，EluxUI组件可通过 {@link LoadComponent} 来加载，参见 {@link exportModule}
 *
 * {@link exportComponent} VS {@link exportView} 参见：`Elux中组件与视图的区别`
 *
 * @param component - 普通UI组件（如React组件、Vue组件）
 *
 * @returns
 * 返回实现 EluxComponent 接口的UI组件
 *
 * @public
 */
export function exportComponent<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}

/**
 *
 * {@inheritDoc exportComponent}
 *
 * @public
 */
export function exportView<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}

/**
 * 一个空的Model
 *
 * @remarks
 * 常用于Mock一个空Module
 *
 * @public
 */
export class EmptyModel implements CommonModel {
  public get state(): ModuleState {
    return this.store.getState(this.moduleName) as ModuleState;
  }

  constructor(public readonly moduleName: string, protected readonly store: IStore) {}

  onMount(): void {
    const actions = MetaData.moduleApiMap[this.moduleName].actions as {_initState: (state: ModuleState) => Action};
    this.store.dispatch(actions._initState({}));
  }

  onActive(): void {
    return;
  }
  onInactive(): void {
    return;
  }

  @reducer
  protected _initState(state: ModuleState): ModuleState {
    return state;
  }
}

export function exportModuleFacade(
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
  return {
    moduleName,
    ModelClass,
    components: components as {[componentName: string]: EluxComponent},
    data,
    state: {},
    actions: {},
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
export function setLoading<T extends Promise<any>>(item: T, store: IStore, _moduleName?: string, _groupName?: string): T {
  const moduleName = _moduleName || coreConfig.StageModuleName;
  const groupName = _groupName || 'globalLoading';
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings: {[moduleNameAndGroupName: string]: TaskCounter} = (store as any).loadingGroups;
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
  before: (store: IStore, action: Action, effectResult: unknown) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: unknown, effectResult: unknown) => void)
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
export function effect(loadingKey?: string | null): Function {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingKey !== null && !env.isServer) {
      // eslint-disable-next-line no-inner-declarations
      const injectLoading = function (this: CommonModel, store: IStore, curAction: Action, effectPromise: Promise<unknown>) {
        let loadingForModuleName: string | undefined;
        let loadingForGroupName: string | undefined;
        if (loadingKey === undefined) {
          loadingForModuleName = coreConfig.StageModuleName;
          loadingForGroupName = 'globalLoading';
        } else {
          [loadingForModuleName, loadingForGroupName] = loadingKey.split('.');
        }
        if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }
        setLoading(effectPromise, store, loadingForModuleName!, loadingForGroupName!);
      };
      const decorators = fun.__decorators__ || [];
      fun.__decorators__ = decorators;
      decorators.push([injectLoading, null]);
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}
