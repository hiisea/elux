import { coreConfig } from '@elux/core';
import { memo, useMemo } from 'react';

var Component = function Component(_ref) {
  var title = _ref.title,
      html = _ref.html;
  var router = coreConfig.UseRouter();
  var documentHead = useMemo(function () {
    var documentHead = html || '';

    if (title) {
      if (/<title>.*?<\/title>/.test(documentHead)) {
        documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
      } else {
        documentHead = "<title>" + title + "</title>" + documentHead;
      }
    }

    return documentHead;
  }, [html, title]);
  router.setDocumentHead(documentHead);
  return null;
};

Component.displayName = 'EluxDocumentHead';
export var DocumentHead = memo(Component);