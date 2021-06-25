import {
  CoreModuleHandlers,
  CoreModuleState,
  IStoreMiddleware,
  config,
  reducer,
  deepMerge,
  mergeState,
  deepMergeState,
  IStore,
  CommonModule,
  IModuleHandlers,
  exportModule,
} from '@elux/core';
import {createLocationTransform, LocationTransform} from './transform';
import type {RootParams, RouteState, HistoryAction} from './basic';
import type {PagenameMap, NativeLocationMap} from './transform';

export class ModuleWithRouteHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? (deepMerge({}, initState, routeParams) as any) : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return deepMergeState(this.state, payload) as S;
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `route${config.NSP}RouteChange`,
  TestRouteChange: `route${config.NSP}TestRouteChange`,
};
export function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState],
  };
}
export function routeParamsAction(moduleName: string, params: any, action: HistoryAction) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action],
  };
}
export function routeChangeAction<P extends RootParams>(routeState: RouteState<P>) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}
export const routeMiddleware: IStoreMiddleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const routeState: RouteState<any> = action.payload![0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach((moduleName) => {
      const routeParams = rootRouteParams[moduleName];
      if (routeParams && Object.keys(routeParams).length > 0) {
        if (rootState[moduleName]) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
    return result;
  }
  return next(action);
};

interface IRouteModuleHandlers extends IModuleHandlers {
  initState: RouteState<any>;
}

class RouteModuleHandlers implements IRouteModuleHandlers {
  initState!: RouteState;

  moduleName!: string;

  store!: IStore<any>;

  actions!: {};

  protected get state(): RouteState {
    return this.store.getState(this.moduleName) as RouteState;
  }

  @reducer
  RouteChange(routeState: RouteState) {
    return mergeState(this.state, routeState);
  }
}

export type RouteModule = CommonModule & {locationTransform: LocationTransform};

const defaultNativeLocationMap: NativeLocationMap = {
  in(nativeLocation) {
    return nativeLocation;
  },
  out(nativeLocation) {
    return nativeLocation;
  },
};
export function createRouteModule<G extends PagenameMap<any>>(
  pagenameMap: G,
  nativeLocationMap: NativeLocationMap = defaultNativeLocationMap,
  notfoundPagename: string = '/404',
  paramsKey: string = '_'
) {
  const handlers: {new (): IRouteModuleHandlers} = RouteModuleHandlers;
  const locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const routeModule = exportModule('route', handlers, {}, {} as {[k in keyof G]: any});
  return {...routeModule, locationTransform};
}
