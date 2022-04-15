import {coreConfig, EluxContext, IRouter, MetaData} from './basic';
import env from './env';

/**
 * 应用Render参数
 *
 * @public
 */
export interface RenderOptions {
  /**
   * 挂载应用 Dom 的 id
   *
   * @defaultValue `root`
   *
   * @remarks
   * 默认: `root`
   */
  id?: string;
}

export function buildApp<INS = {}>(
  ins: INS,
  router: IRouter
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

export function buildProvider<INS = {}>(
  ins: INS,
  router: IRouter
): INS & {
  render(options?: RenderOptions): Elux.Component<{children: any}>;
} {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render() {
      router.init({});
      MetaData.AppProvider = AppRender.toProvider({router, documentHead: ''}, ins, store);
      return MetaData.AppProvider;
    },
  });
}

export function buildSSR<INS = {}>(
  ins: INS,
  router: IRouter
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
export function getAppProvider(): Elux.Component<{children: any}> {
  return MetaData.AppProvider!;
}
