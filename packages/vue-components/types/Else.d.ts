import { FunctionalComponent, VNode } from 'vue';
/**
 * 内置UI组件
 *
 * @remarks
 * 用来控制子元素的渲染方式：如果非空子元素大于0，则渲染所有非空子元素，否则将渲染`props.elseView`，
 * 与 {@link Switch | `<Switch>`} 的区别在于：`<Switch>` 仅渲染非空子元素中的第1个
 *
 * @example
 * ```html
 *<Else elseView={<NotFound />}>
 *  {subView === 'detail' && <Detail />}
 *  {subView === 'list' && <List />}
 *</Else>
 * ```
 *
 * @public
 */
export interface ElseProps {
    elseView?: VNode;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link ElseProps}
 *
 * @public
 */
export declare const Else: FunctionalComponent<ElseProps>;
//# sourceMappingURL=Else.d.ts.map