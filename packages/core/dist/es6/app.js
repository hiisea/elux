import { coreConfig } from './basic';
import env from './env';
export function buildApp(ins, router) {
  const store = router.getCurrentPage().store;
  const ssrData = env[coreConfig.SSRDataKey];
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init(ssrData || {}).then(() => {
        AppRender.toDocument(id, {
          router,
          documentHead: ''
        }, !!ssrData, ins, store);
      });
    }

  });
}
export function buildProvider(ins, router) {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender;
  router.init({});
  return AppRender.toProvider({
    router,
    documentHead: ''
  }, ins, store);
}
export function buildSSR(ins, router) {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init({}).then(() => {
        store.destroy();
        const eluxContext = {
          router,
          documentHead: ''
        };
        return AppRender.toString(id, eluxContext, ins, store).then(html => {
          const {
            SSRTPL,
            SSRDataKey
          } = coreConfig;
          const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

          if (match) {
            const state = store.getState();
            return SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${SSRDataKey} = ${JSON.stringify(state)};</script>\r\n</head>`).replace(match[0], match[0] + html);
          }

          return html;
        });
      });
    }

  });
}