import React, { useContext, useEffect } from 'react';
import { env, isServer } from '@elux/core';
import { EluxContext } from '../sington';
let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 0);
  }
}

const Component = ({
  title = '',
  html = ''
}) => {
  if (title) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  }

  const eluxContext = useContext(EluxContext);

  if (isServer()) {
    eluxContext.documentHead = html;
  }

  useEffect(() => {
    const raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    return () => setClientHead(eluxContext, raw);
  }, [eluxContext, html]);
  return null;
};

export default React.memo(Component);