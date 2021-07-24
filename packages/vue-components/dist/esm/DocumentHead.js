import { env, isServer } from '@elux/core';
import { inject, defineComponent } from 'vue';
import { EluxContextKey } from './base';
var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

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
  data: function data() {
    return {
      eluxContext: inject(EluxContextKey, {
        documentHead: ''
      }),
      raw: ''
    };
  },
  computed: {
    headText: function headText() {
      var title = this.title;
      var html = this.html;

      if (!html) {
        html = "<title>" + title + "</title>";
      }

      if (title) {
        return html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
      }

      return html;
    }
  },
  mounted: function mounted() {
    this.raw = this.eluxContext.documentHead;
    setClientHead(this.eluxContext, this.headText);
  },
  unmounted: function unmounted() {
    setClientHead(this.eluxContext, this.raw);
  },
  render: function render() {
    if (isServer()) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }
});