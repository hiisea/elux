import { Dispatch, EluxComponent } from '@elux/core';
import { ComponentClass, ComponentType, FunctionComponent } from 'react';
import { Options } from 'react-redux';
/**
 * 用于{@link connectRedux }
 *
 * @remarks
 * 参见 {@link connectRedux }
 *
 * @public
 */
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
/**
 * 用于{@link connectRedux }
 *
 * @remarks
 * 参见 {@link connectRedux }
 *
 * @public
 */
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => EluxComponent & ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
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
export declare function connectRedux<S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
    dispatch: Dispatch;
}>;
export { batch, connect, connectAdvanced, createSelectorHook, shallowEqual, useSelector } from 'react-redux';
//# sourceMappingURL=index.d.ts.map