import React, { useContext, useEffect } from 'react';
import { env } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        reactComponentsConfig.setPageTitle(arr[1]);
      }
    }, 0);
  }
}

let recoverLock = false;

function recoverClientHead(eluxContext, documentHead) {
  if (!recoverLock) {
    recoverLock = true;
    setClientHead(eluxContext, documentHead);
  }
}

const Component = ({
  title = '',
  html = ''
}) => {
  if (!html) {
    html = `<title>${title}</title>`;
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  }

  const eluxContext = useContext(EluxContextComponent);

  if (env.isServer) {
    eluxContext.documentHead = html;
  }

  useEffect(() => {
    const raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    recoverLock = false;
    return () => recoverClientHead(eluxContext, raw);
  }, [eluxContext, html]);
  return null;
};

export default React.memo(Component);