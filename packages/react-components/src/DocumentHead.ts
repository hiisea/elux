import React, {useContext, useEffect} from 'react';
import {env} from '@elux/core';
import {EluxContext, EluxContextComponent, reactComponentsConfig} from './base';

/**
 * 内置React组件
 *
 * @remarks
 * 以组件的方式维护`<head></head>`标签中的`<title>、<meta>`等不可见元素，可用于服务器环境（SSR）
 *
 * @example
 * ```html
 * <DocumentHead
 *   title='文章'
 *   html='<meta name="keywords" content="域名,域名推广,域名注册">'
 * />
 * ```
 *
 * @public
 */
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

/**
 * 内置React组件
 *
 * @remarks
 * 参见：{@link DocumentHeadProps}
 *
 * @public
 */
export const DocumentHead = React.memo(Component);
