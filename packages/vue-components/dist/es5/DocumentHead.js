import { defineComponent, inject } from 'vue';
import { coreConfig, env } from '@elux/core';
import { EluxContextKey } from './base';
var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        coreConfig.SetPageTitle(arr[1]);
      }
    }, 0);
  }
}

export var DocumentHead = defineComponent({
  props: {
    title: {
      type: String
    },
    html: {
      type: String
    }
  },
  data: function data() {
    return {
      eluxContext: inject(EluxContextKey, {}),
      raw: ''
    };
  },
  computed: {
    headText: function headText() {
      var title = this.title || '';
      var html = this.html || '';
      var eluxContext = this.eluxContext;

      if (!html) {
        html = eluxContext.documentHead || '<title>Elux</title>';
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
    if (env.isServer) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }
});