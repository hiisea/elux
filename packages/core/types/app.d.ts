import { IRouter } from './basic';
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
export declare function buildApp<INS = {}>(ins: INS, router: IRouter): INS & {
    render(options?: RenderOptions): Promise<void>;
};
export declare function buildProvider<INS = {}>(ins: INS, router: IRouter): Elux.Component<{
    children: any;
}>;
export declare function buildSSR<INS = {}>(ins: INS, router: IRouter): INS & {
    render(options?: RenderOptions): Promise<string>;
};
//# sourceMappingURL=app.d.ts.map