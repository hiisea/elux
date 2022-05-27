import {coreConfig, EluxContext, env} from '@elux/core';
import {FC, memo, useContext, useEffect} from 'react';
import {EluxContextComponent} from './base';

/**
 * 内置UI组件
 *
 * @remarks
 * 用组件的方式动态修改`<head>内容`，主要是`title/description/keywords`等meta信息，SSR中非常有用
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
        coreConfig.SetPageTitle(arr[1]);
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

const Component: FC<DocumentHeadProps> = ({title, html}) => {
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

Component.displayName = 'EluxDocumentHead';

/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link DocumentHeadProps}
 *
 * @public
 */
export const DocumentHead = memo(Component);
