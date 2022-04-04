import env from './env';
import {EluxContext, coreConfig} from './basic';
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
  render(options?: RenderOptions): Promise<string>;
} {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render({id = 'root'}: RenderOptions = {}) {
      return router.init({}).then(() => {
        store.destroy();
        const eluxContext: EluxContext = {router, documentHead: ''};
        return AppRender.toString(id, eluxContext, ins, store).then((html) => {
          const {SSRTPL, SSRDataKey} = coreConfig;
          const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
          if (match) {
            const state = store.getState();
            return SSRTPL.replace(
              '</head>',
              `\r\n${eluxContext.documentHead}\r\n<script>window.${SSRDataKey} = ${JSON.stringify(state)};</script>\r\n</head>`
            ).replace(match[0], match[0] + html);
          }
          return html;
        });
      });
    },
  });
}
