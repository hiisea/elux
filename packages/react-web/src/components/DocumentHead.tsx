import React, {useContext, useEffect} from 'react';
import {env, isServer} from '@elux/core';
import {EluxContext, EluxContextType} from '../sington';

interface Props {
  title?: string;
  html?: string;
}

let clientTimer = 0;

function setClientHead(eluxContext: EluxContextType, documentHead: string) {
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

const Component: React.FC<Props> = ({title = '', html = ''}) => {
  if (!html) {
    html = `<title>${title}</title>`;
  }
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
