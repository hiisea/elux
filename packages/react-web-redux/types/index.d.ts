import type { Options } from 'react-redux';
import type { ComponentType, FunctionComponent, ComponentClass } from 'react';
import type { Dispatch, EluxComponent } from '@elux/react-web';
export { createRedux } from '@elux/react-web';
export type { ReduxStore, ReduxOptions } from '@elux/react-web';
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface ConnectRedux {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export declare const connectRedux: ConnectRedux;
export * from 'react-redux';
