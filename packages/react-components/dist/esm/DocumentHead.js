import React, { useContext, useEffect } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent } from './base';
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

var Component = function Component(_ref) {
  var _ref$title = _ref.title,
      title = _ref$title === void 0 ? '' : _ref$title,
      _ref$html = _ref.html,
      html = _ref$html === void 0 ? '' : _ref$html;

  if (!html) {
    html = "<title>" + title + "</title>";
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
  }

  var eluxContext = useContext(EluxContextComponent);

  if (env.isServer) {
    eluxContext.documentHead = html;
  }

  useEffect(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    return function () {
      return setClientHead(eluxContext, raw);
    };
  }, [eluxContext, html]);
  return null;
};

export default React.memo(Component);