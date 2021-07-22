import React, { useContext, useEffect } from 'react';
import { env } from '@elux/core';
import Taro from '@tarojs/taro';
import { EluxContext } from '../sington';
let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;

      if (eluxContext.documentHead) {
        Taro.setNavigationBarTitle({
          title: eluxContext.documentHead
        });
      }
    }, 0);
  }
}

const Component = ({
  title = ''
}) => {
  const eluxContext = useContext(EluxContext);
  useEffect(() => {
    const raw = eluxContext.documentHead;
    setClientHead(eluxContext, title);
    return () => setClientHead(eluxContext, raw);
  }, [eluxContext, title]);
  return null;
};

export default React.memo(Component);