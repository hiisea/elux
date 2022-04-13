import {Comment, DefineComponent, Fragment, h, VNode} from 'vue';

/**
 * 内置UI组件
 *
 * @remarks
 * 该组件用来控制子元素的渲染方式：如果非空子元素大于0，则渲染所有非空子元素，否则将渲染`props.elseView`，
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Else: DefineComponent<ElseProps> = function (props: ElseProps, context: {slots: {default?: () => VNode[]; elseView?: () => VNode[]}}) {
  const arr: VNode[] = [];
  const children: VNode[] = context.slots.default ? context.slots.default() : [];
  children.forEach((item) => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });
  if (arr.length > 0) {
    return h(Fragment, null, arr);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
} as any;
