import {coreConfig, EluxContext, IRouter, RouterInitOptions} from './basic';
import env from './env';
import type {CoreRouter} from './store';

/**
 * 创建应用时Render参数
 *
 * @public
 */
export interface RenderOptions {
  /**
   * 挂载应用Dom的id
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
  router: IRouter,
  routerOptions: RouterInitOptions
): INS & {
  render(options?: RenderOptions): Promise<void>;
} {
  const ssrData = env[coreConfig.SSRDataKey];
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render({id = 'root'}: RenderOptions = {}) {
      return (router as CoreRouter).init(routerOptions, ssrData || {}).then(() => {
        AppRender.toDocument(id, {router}, !!ssrData, ins);
      });
    },
  });
}

export function buildProvider<INS = {}>(ins: INS, router: IRouter): Elux.Component<{children: any}> {
  const AppRender = coreConfig.AppRender!;
  //(router as CoreRouter).init({});
  return AppRender.toProvider({router}, ins);
}

export function buildSSR<INS = {}>(
  ins: INS,
  router: IRouter,
  routerOptions: RouterInitOptions
): INS & {
  render(options?: RenderOptions): Promise<string>;
} {
  const AppRender = coreConfig.AppRender!;
  return Object.assign(ins, {
    render({id = 'root'}: RenderOptions = {}) {
      return (router as CoreRouter).init(routerOptions, {}).then(() => {
        const store = router.getActivePage().store;
        store.destroy();
        const eluxContext: EluxContext = {router};
        return AppRender.toString(id, eluxContext, ins).then((html) => {
          const {SSRTPL, SSRDataKey} = coreConfig;
          const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
          if (match) {
            const state = store.getState();
            return SSRTPL.replace(
              '</head>',
              `\r\n${router.getDocumentHead()}\r\n<script>window.${SSRDataKey} = ${JSON.stringify(state)};</script>\r\n</head>`
            ).replace(match[0], match[0] + html);
          }
          return html;
        });
      });
    },
  });
}

/**
 * 获取SSR页面模版
 *
 * @public
 */
export function getTplInSSR(): string {
  return coreConfig.SSRTPL;
}
