import {defineComponent, FunctionalComponent, inject} from 'vue';

import {coreConfig, EluxContext, env} from '@elux/core';

import {EluxContextKey} from './base';

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

let clientTimer = 0;

function setClientHead(eluxContext: EluxContext, documentHead: string) {
  eluxContext.documentHead = documentHead;
  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];
      if (arr[1]) {
        coreConfig.SetPageTitle(arr[1]);
      }
    }, 0);
  }
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
  props: {
    title: {
      type: String,
    },
    html: {
      type: String,
    },
  },
  data() {
    return {
      eluxContext: inject<EluxContext>(EluxContextKey, {} as any),
      raw: '',
    };
  },
  computed: {
    headText(): string {
      const title = this.title || '';
      let html = this.html || '';
      const eluxContext = this.eluxContext;
      if (!html) {
        html = eluxContext.documentHead || '<title>Elux</title>';
      }
      if (title) {
        return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      }
      return html;
    },
  },
  mounted() {
    this.raw = this.eluxContext.documentHead;
    setClientHead(this.eluxContext, this.headText);
  },
  unmounted() {
    setClientHead(this.eluxContext, this.raw);
  },
  render() {
    if (env.isServer) {
      this.eluxContext.documentHead = this.headText;
    }
    return null;
  },
}) as any;
