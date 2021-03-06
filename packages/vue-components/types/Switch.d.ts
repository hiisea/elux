import { FunctionalComponent, VNode } from 'vue';
/**
 * 内置UI组件
 *
 * @remarks
 * 用来控制子元素的渲染方式：如果非空子元素大于0，则渲染第一个非空子元素，否则将渲染`props.elseView`，
 * 与 {@link Else | `<Else>`} 的区别在于：`<Else>` 渲染所有非空子元素
 *
 * @example
 * ```html
 *<Switch elseView={<NotFound />}>
 *  {subView === 'detail' && <Detail />}
 *  {subView === 'list' && <List />}
 *</Switch>
 * ```
 *
 * @public
 */
export interface SwitchProps {
    elseView?: VNode;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link SwitchProps}
 *
 * @public
 */
export declare const Switch: FunctionalComponent<SwitchProps>;
//# sourceMappingURL=Switch.d.ts.map