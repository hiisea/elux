import { coreConfig, env } from '@elux/core';
import { memo, useContext, useEffect } from 'react';
import { EluxContextComponent } from './base';
let clientTimer = 0;
let recoverLock = false;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      recoverLock = false;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

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

const Component = ({
  title,
  html
}) => {
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
    setClientHead(eluxContext, html);
    recoverLock = false;
    return () => recoverClientHead(eluxContext, raw);
  }, [eluxContext, html]);
  return null;
};

Component.displayName = 'EluxDocumentHead';
export const DocumentHead = memo(Component);