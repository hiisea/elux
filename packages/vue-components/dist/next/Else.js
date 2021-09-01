import { Fragment, h, Comment } from 'vue';
export default function (props, context) {
  const arr = [];
  const children = context.slots.default ? context.slots.default() : [];
  children.forEach(item => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return h(Fragment, null, arr);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
}