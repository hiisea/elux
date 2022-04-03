import env from './env';
import { coreConfig } from './basic';
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
export function buildSSR(ins, router) {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init({}).then(() => {
        AppRender.toString(id, {
          router,
          documentHead: ''
        }, ins, store);
      });
    }

  });
}