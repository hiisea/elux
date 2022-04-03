import env from './env';
import {coreConfig} from './basic';
import {CoreRouter} from './store';

export interface RenderOptions {
  /**
   * 挂载 Dom 的 id，默认为 `root`
   */
  id?: string;
}

export function buildApp<INS = {}>(
  ins: INS,
  router: CoreRouter
): INS & {
  render(options?: RenderOptions): Promise<void>;
} {
  const store = router.getCurrentPage().store;
  const ssrData = env[coreConfig.SSRDataKey];
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render({id = 'root'}: RenderOptions = {}) {
      return router.init(ssrData || {}).then(() => {
        AppRender.toDocument(id, {router, documentHead: ''}, !!ssrData, ins, store);
      });
    },
  });
}

export function buildSSR<INS = {}>(
  ins: INS,
  router: CoreRouter
): INS & {
  render(options?: RenderOptions): Promise<void>;
} {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render({id = 'root'}: RenderOptions = {}) {
      return router.init({}).then(() => {
        AppRender.toString(id, {router, documentHead: ''}, ins, store);
      });
    },
  });
}
