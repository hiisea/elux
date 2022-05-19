import {Comment, FunctionalComponent, Fragment, h, VNode} from 'vue';
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Switch: FunctionalComponent<SwitchProps> = function (
  props: SwitchProps,
  context: {slots: {default?: () => VNode[]; elseView?: () => VNode[]}}
) {
  const arr: VNode[] = [];
  const children: VNode[] = context.slots.default ? context.slots.default() : [];
  children.forEach((item) => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });
  if (arr.length > 0) {
    return h(Fragment, null, [arr[0]]);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
} as any;

// export default defineComponent({
//   props: {
//     elseView: {
//       type: Object as PropType<VNode>,
//     },
//   },
//   setup(props, {slots}) {
//     return () => {
//       const arr: VNode[] = [];
//
//       children.forEach((item) => {
//         if (item.type !== Comment) {
//           arr.push(item);
//         }
//       });
//       if (arr.length > 0) {
//         return <>{arr[0]}</>;
//       }
//       return <>{props.elseView}</>;
//     };
//   },
// });
