import {Fragment, h, VNode, Comment} from 'vue';

/*** @public */
export interface SwitchProps {
  elseView?: VNode;
}

/*** @public */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (props: SwitchProps, context: {slots: {default?: () => VNode[]; elseView?: () => VNode[]}}) {
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
}

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
