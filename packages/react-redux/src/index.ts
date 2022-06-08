import {Dispatch, EluxComponent, exportView, setCoreConfig} from '@elux/core';
import {ComponentClass, ComponentType, FunctionComponent} from 'react';
import {connect, Options, Provider, useStore} from 'react-redux';

/**
 * 用于{@link connectRedux }
 *
 * @remarks
 * 参见 {@link connectRedux }
 *
 * @public
 */
export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

/**
 * 用于{@link connectRedux }
 *
 * @remarks
 * 参见 {@link connectRedux }
 *
 * @public
 */
export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(
  component: C
) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

/**
 * 连接store与react组件
 *
 * @remarks
 * 参见{@link https://react-redux.js.org/api/connect | react-redux/connect }
 *
 * @param mapStateToProps - state与props之间的映射与转换
 * @param options - 连接参数设置
 *
 * @public
 */
export function connectRedux<S = {}, D = {}, W = {}>(
  mapStateToProps?: (state: any, owner: W) => S,
  options?: Options<any, S, W>
): InferableComponentEnhancerWithProps<S & D & {dispatch: Dispatch}> {
  return function (component: any) {
    return exportView(connect(mapStateToProps, options)(component)) as any;
  };
}

setCoreConfig({UseStore: useStore as any, StoreProvider: Provider as any});

export {batch, connect, connectAdvanced, createSelectorHook, shallowEqual, useSelector} from 'react-redux';
