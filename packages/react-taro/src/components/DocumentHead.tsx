import React, {useContext, useEffect} from 'react';
import {env} from '@elux/core';
import Taro from '@tarojs/taro';
import {EluxContext, EluxContextType} from '../sington';

interface Props {
  title?: string;
}

let clientTimer = 0;

function setClientHead(eluxContext: EluxContextType, documentHead: string) {
  eluxContext.documentHead = documentHead;
  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      if (eluxContext.documentHead) {
        Taro.setNavigationBarTitle({title: eluxContext.documentHead});
      }
    }, 0);
  }
}

const Component: React.FC<Props> = ({title = ''}) => {
  const eluxContext = useContext(EluxContext);
  useEffect(() => {
    const raw = eluxContext.documentHead;
    setClientHead(eluxContext, title);
    return () => setClientHead(eluxContext, raw);
  }, [eluxContext, title]);
  return null;
};

export default React.memo(Component);
