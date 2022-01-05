import React, {useContext, useEffect} from 'react';
import {env} from '@elux/core';
import {EluxContext, EluxContextComponent, reactComponentsConfig} from './base';

/*** @public */
export interface DocumentHeadProps {
  title?: string;
  html?: string;
}

let clientTimer = 0;
let recoverLock = false;
function setClientHead(eluxContext: EluxContext, documentHead: string) {
  eluxContext.documentHead = documentHead;
  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      recoverLock = false;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];
      if (arr[1]) {
        reactComponentsConfig.setPageTitle(arr[1]);
      }
    }, 0);
  }
}

function recoverClientHead(eluxContext: EluxContext, documentHead: string) {
  if (!recoverLock) {
    recoverLock = true;
    setClientHead(eluxContext, documentHead);
  }
}

const Component: React.FC<DocumentHeadProps> = ({title, html}) => {
  const eluxContext = useContext(EluxContextComponent);
  if (!html) {
    html = eluxContext.documentHead || '<title>Elux</title>';
  }
  if (title) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  }
  if (env.isServer) {
    eluxContext.documentHead = html;
  }
  useEffect(() => {
    const raw = eluxContext.documentHead;
    setClientHead(eluxContext, html!);
    recoverLock = false;
    return () => recoverClientHead(eluxContext, raw);
  }, [eluxContext, html]);
  return null;
};

/*** @public */
export default React.memo(Component);
