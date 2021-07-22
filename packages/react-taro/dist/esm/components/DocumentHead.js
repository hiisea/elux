import React, { useContext, useEffect } from 'react';
import { env } from '@elux/core';
import Taro from '@tarojs/taro';
import { EluxContext } from '../sington';
var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;

      if (eluxContext.documentHead) {
        Taro.setNavigationBarTitle({
          title: eluxContext.documentHead
        });
      }
    }, 0);
  }
}

var Component = function Component(_ref) {
  var _ref$title = _ref.title,
      title = _ref$title === void 0 ? '' : _ref$title;
  var eluxContext = useContext(EluxContext);
  useEffect(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, title);
    return function () {
      return setClientHead(eluxContext, raw);
    };
  }, [eluxContext, title]);
  return null;
};

export default React.memo(Component);