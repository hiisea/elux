import { ComponentType, FunctionComponent, ComponentClass } from 'react';
import { Options } from 'react-redux';
import { Dispatch, EluxComponent } from '@elux/core';
export type { ReduxStore, ReduxOptions } from '@elux/core-redux';
export { createRedux } from '@elux/core-redux';
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface ConnectRedux {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export declare const connectRedux: ConnectRedux;
export { shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect, useStore } from 'react-redux';
