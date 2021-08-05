import {
  CoreModuleHandlers,
  IStoreMiddleware,
  coreConfig,
  reducer,
  mergeState,
  deepMergeState,
  Action,
  CommonModule,
  IModuleHandlers,
  exportModule,
  ICoreRouter,
} from '@elux/core';
import {createLocationTransform, LocationTransform, PagenameMap, NativeLocationMap} from './transform';
import {RootParams, RouteState, HistoryAction} from './basic';

export class ModuleWithRouteHandlers<S extends Record<string, any>, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? (deepMergeState(initState, routeParams) as any) : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return deepMergeState(this.state, payload) as S;
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `route${coreConfig.NSP}RouteChange`,
  TestRouteChange: `route${coreConfig.NSP}TestRouteChange`,
};
export function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>, prevRootState?: Record<string, any>): Action {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState, prevRootState],
  };
}
export function routeParamsAction(moduleName: string, params: any, action: HistoryAction, prevRootState?: Record<string, any>): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action, prevRootState],
  };
}
export function routeChangeAction<P extends RootParams>(routeState: RouteState<P>, prevRootState?: Record<string, any>): Action {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState, prevRootState],
  };
}
export const routeMiddleware: IStoreMiddleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const [routeState, prevRootState] = action.payload as [RouteState<any>, Record<string, any>];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach((moduleName) => {
      const routeParams = rootRouteParams[moduleName];
      if (routeParams && Object.keys(routeParams).length > 0) {
        if (rootState[moduleName]) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action, prevRootState));
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
  initState: RouteState = {} as any;

  constructor(public readonly moduleName: string, public readonly router: ICoreRouter) {}

  protected get state(): RouteState {
    return this.router.getCurrentStore().getState(this.moduleName) as RouteState;
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRouteModule<G extends PagenameMap>(
  pagenameMap: G,
  nativeLocationMap: NativeLocationMap = defaultNativeLocationMap,
  notfoundPagename = '/404',
  paramsKey = '_'
) {
  const handlers: {new (moduleName: string, context: ICoreRouter): IRouteModuleHandlers} = RouteModuleHandlers;
  const locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const routeModule = exportModule('route', handlers, {}, {} as {[k in keyof G]: any});
  return {...routeModule, locationTransform};
}
