import { IRouter, RouterInitOptions } from './basic';
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
export declare function buildApp<INS = {}>(ins: INS, router: IRouter, routerOptions: RouterInitOptions): INS & {
    render(options?: RenderOptions): Promise<void>;
};
export declare function buildProvider<INS = {}>(ins: INS, router: IRouter): Elux.Component<{
    children: any;
}>;
export declare function buildSSR<INS = {}>(ins: INS, router: IRouter, routerOptions: RouterInitOptions): INS & {
    render(options?: RenderOptions): Promise<string>;
};
/**
 * 获取SSR页面模版
 *
 * @public
 */
export declare function getTplInSSR(): string;
//# sourceMappingURL=app.d.ts.map