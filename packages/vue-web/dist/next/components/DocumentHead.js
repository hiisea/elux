import { env, isServer } from '@elux/core';
import { inject, defineComponent } from 'vue';
import { EluxContextKey } from '../sington';
let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
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

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      eluxContext: inject(EluxContextKey, {
        documentHead: ''
      }),
      raw: ''
    };
  },

  computed: {
    headText() {
      const {
        title,
        html
      } = this;

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
    if (isServer()) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }

});