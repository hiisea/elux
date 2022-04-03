import { inject, defineComponent } from 'vue';
import { env, coreConfig } from '@elux/core';
import { EluxContextKey } from './base';
let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
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

export const DocumentHead = defineComponent({
  props: {
    title: {
      type: String
    },
    html: {
      type: String
    }
  },

  data() {
    return {
      eluxContext: inject(EluxContextKey, {}),
      raw: ''
    };
  },

  computed: {
    headText() {
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
    }

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
  }

});