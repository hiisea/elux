import {connect} from 'react-redux';
import {exportView} from '@elux/core';
import type {Options} from 'react-redux';
import type {ComponentType, FunctionComponent, ComponentClass} from 'react';
import type {Dispatch, EluxComponent} from '@elux/core';

export type {ReduxStore, ReduxOptions} from '@elux/core-redux';
export {createRedux} from '@elux/core-redux';
export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(
  component: C
) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

export interface ConnectRedux {
  <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<
    S & D & {dispatch: Dispatch}
  >;
}

export const connectRedux: ConnectRedux = function (...args) {
  return function (component: any) {
    return exportView(connect(...args)(component)) as any;
  };
};

export {shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider} from 'react-redux';
