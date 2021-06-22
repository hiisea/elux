import {connect} from 'react-redux';
import {defineView} from '@elux/core';
import type {Options} from 'react-redux';
import type {ComponentType, FunctionComponent, ComponentClass} from 'react';
import type {Dispatch} from '@elux/core';

export {Provider} from 'react-redux';
export {createRedux} from '@elux/core-redux';

export type {ReduxStore, ReduxOptions} from '@elux/core-redux';
export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

export interface ConnectRedux {
  <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<
    S & D & {dispatch: Dispatch}
  >;
}

export const connectRedux: ConnectRedux = function (...args) {
  return function (component: any) {
    defineView(component);
    return connect(...args)(component) as any;
  };
};
