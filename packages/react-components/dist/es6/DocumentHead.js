import { coreConfig } from '@elux/core';
import { memo, useMemo } from 'react';

const Component = ({
  title,
  html
}) => {
  const router = coreConfig.UseRouter();
  const documentHead = useMemo(() => {
    let documentHead = html || '';

    if (title) {
      if (/<title>.*?<\/title>/.test(documentHead)) {
        documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      } else {
        documentHead = `<title>${title}</title>` + documentHead;
      }
    }

    return documentHead;
  }, [html, title]);
  router.setDocumentHead(documentHead);
  return null;
};

Component.displayName = 'EluxDocumentHead';
export const DocumentHead = memo(Component);