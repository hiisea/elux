import React, { useContext, useEffect } from 'react';
import { env, coreConfig } from '@elux/core';
import { EluxContextComponent } from './base';
var clientTimer = 0;
var recoverLock = false;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      recoverLock = false;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        coreConfig.SetPageTitle(arr[1]);
      }
    }, 0);
  }
}

function recoverClientHead(eluxContext, documentHead) {
  if (!recoverLock) {
    recoverLock = true;
    setClientHead(eluxContext, documentHead);
  }
}

var Component = function Component(_ref) {
  var title = _ref.title,
      html = _ref.html;
  var eluxContext = useContext(EluxContextComponent);

  if (!html) {
    html = eluxContext.documentHead || '<title>Elux</title>';
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
  }

  if (env.isServer) {
    eluxContext.documentHead = html;
  }

  useEffect(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    recoverLock = false;
    return function () {
      return recoverClientHead(eluxContext, raw);
    };
  }, [eluxContext, html]);
  return null;
};

export var DocumentHead = React.memo(Component);