import {ComponentType, FunctionComponent, ComponentClass} from 'react';
import {connect, Provider, Options} from 'react-redux';
import {exportView, Dispatch, EluxComponent} from '@elux/core';
import {setReactComponentsConfig} from '@elux/react-web';

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

export {shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect} from 'react-redux';

setReactComponentsConfig({Provider: Provider as any});
