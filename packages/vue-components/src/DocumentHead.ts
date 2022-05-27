import {coreConfig} from '@elux/core';
import {computed, defineComponent, FunctionalComponent} from 'vue';

/**
 * 内置UI组件
 *
 * @remarks
 * 用组件的方式动态修改`<head>内容`，主要是`title/description/keywords`等meta信息，SSR中非常有用
 *
 * @example
 * ```html
 * <DocumentHead
 *   title='文章'
 *   html='<meta name="keywords" content="域名,域名推广,域名注册">'
 * />
 * ```
 *
 * @public
 */
export interface DocumentHeadProps {
  title?: string;
  html?: string;
}

/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link DocumentHeadProps}
 *
 * @public
 */
export const DocumentHead: FunctionalComponent<DocumentHeadProps> = defineComponent({
  name: 'EluxDocumentHead',
  // eslint-disable-next-line vue/require-prop-types
  props: ['title', 'html'],
  setup(props: DocumentHeadProps) {
    const documentHead = computed(() => {
      let documentHead = props.html || '';
      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${props.title}</title>`);
        } else {
          documentHead = `<title>${props.title}</title>` + documentHead;
        }
      }
      return documentHead;
    });
    const router = coreConfig.UseRouter!();
    return () => {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  },
}) as any;
