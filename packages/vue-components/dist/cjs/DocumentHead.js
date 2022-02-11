"use strict";

exports.__esModule = true;
exports.default = void 0;

var _core = require("@elux/core");

var _vue = require("vue");

var _base = require("./base");

var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = _core.env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        _core.env.document.title = arr[1];
      }
    }, 0);
  }
}

var Component = (0, _vue.defineComponent)({
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
      eluxContext: (0, _vue.inject)(_base.EluxContextKey, {
        documentHead: ''
      }),
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
    if ((0, _core.isServer)()) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }
});
var _default = Component;
exports.default = _default;