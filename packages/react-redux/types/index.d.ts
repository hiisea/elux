import { ComponentType, FunctionComponent, ComponentClass } from 'react';
import { Options } from 'react-redux';
import { Dispatch, EluxComponent } from '@elux/core';
export { createStore } from '@elux/core-redux';
/**
 *  @public
 */
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
/**
 *  @public
 */
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
/**
 *  @public
 */
export interface IConnectRedux {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
/**
 *  @public
 */
export declare const connectRedux: IConnectRedux;
export { shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect, useStore } from 'react-redux';
//# sourceMappingURL=index.d.ts.map