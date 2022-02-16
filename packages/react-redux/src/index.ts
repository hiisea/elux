import {ComponentType, FunctionComponent, ComponentClass} from 'react';
import {connect, Options} from 'react-redux';
import {exportView, Dispatch, EluxComponent} from '@elux/core';

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

export {shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect, useStore} from 'react-redux';
