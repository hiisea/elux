import React, { useContext } from 'react';
import { env, isServer } from '@elux/core';
import { EluxContext } from '../sington';
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

var Component = function Component(_ref2) {
  var html = _ref2.html;
  var eluxContext = useContext(EluxContext);
  eluxContext.documentHead = html;

  if (!isServer()) {
    setClientHead(eluxContext);
  }

  return null;
};

export default React.memo(Component);