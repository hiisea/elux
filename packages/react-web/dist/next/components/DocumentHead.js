import React, { useContext } from 'react';
import { env, isServer } from '@elux/core';
import { EluxContext } from '../sington';
let clientTimer = 0;

function setClientHead({
  documentHead
}) {
  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 300);
  }
}

const Component = ({
  html
}) => {
  const eluxContext = useContext(EluxContext);
  eluxContext.documentHead = html;

  if (!isServer()) {
    setClientHead(eluxContext);
  }

  return null;
};

export default React.memo(Component);