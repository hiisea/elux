import { coreConfig } from './basic';
import env from './env';
export function buildApp(ins, router, routerOptions) {
  const ssrData = env[coreConfig.SSRDataKey];
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init(routerOptions, ssrData || {}).then(() => {
        AppRender.toDocument(id, {
          router
        }, !!ssrData, ins);
      });
    }

  });
}
export function buildProvider(ins, router) {
  const AppRender = coreConfig.AppRender;
  return AppRender.toProvider({
    router
  }, ins);
}
export function buildSSR(ins, router, routerOptions) {
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init(routerOptions, {}).then(() => {
        const store = router.getActivePage().store;
        store.destroy();
        const eluxContext = {
          router
        };
        return AppRender.toString(id, eluxContext, ins).then(html => {
          const {
            SSRTPL,
            SSRDataKey
          } = coreConfig;
          const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

          if (match) {
            const state = store.getState();
            return SSRTPL.replace('</head>', `\r\n${router.getDocumentHead()}\r\n<script>window.${SSRDataKey} = ${JSON.stringify(state)};</script>\r\n</head>`).replace(match[0], match[0] + html);
          }

          return html;
        });
      });
    }

  });
}
export function getTplInSSR() {
  return coreConfig.SSRTPL;
}