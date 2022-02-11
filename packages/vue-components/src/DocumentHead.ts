import {env, isServer} from '@elux/core';
import {inject, defineComponent, DefineComponent} from 'vue';
import {EluxContext, EluxContextKey} from './base';

/*** @public */
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
        env.document.title = arr[1];
      }
    }, 0);
  }
}

/*** @public */
const Component: DefineComponent<DocumentHeadProps> = defineComponent({
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
      eluxContext: inject<EluxContext>(EluxContextKey, {documentHead: ''}),
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
    if (isServer()) {
      this.eluxContext.documentHead = this.headText;
    }
    return null;
  },
}) as any;

export default Component;
