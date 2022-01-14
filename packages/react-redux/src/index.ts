import {ComponentType, FunctionComponent, ComponentClass} from 'react';
import {connect, Options} from 'react-redux';
import {exportView, Dispatch, EluxComponent} from '@elux/core';

export type {ReduxStore, ReduxOptions} from '@elux/core-redux';
export {createRedux} from '@elux/core-redux';

/**
 *  @public
 */
export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

/**
 *  @public
 */
export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(
  component: C
) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

/**
 *  @public
 */
export interface IConnectRedux {
  <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<
    S & D & {dispatch: Dispatch}
  >;
}

/**
 *  @public
 */
export const connectRedux: IConnectRedux = function (...args) {
  return function (component: any) {
    return exportView(connect(...args)(component)) as any;
  };
};

export {shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect, useStore} from 'react-redux';
