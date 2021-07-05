import { env, isServer } from '@elux/core';
import { inject } from 'vue';
import { EluxContextKey } from '../sington';
var clientTimer = 0;

function setClientHead(_ref) {
  var documentHead = _ref.documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      var arr = documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 300);
  }
}

export default function (_ref2) {
  var html = _ref2.html;
  var eluxContext = inject(EluxContextKey, {
    documentHead: ''
  });
  eluxContext.documentHead = html;

  if (!isServer()) {
    setClientHead(eluxContext);
  }

  return null;
}