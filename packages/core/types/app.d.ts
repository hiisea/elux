import { CoreRouter } from './store';
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
export declare function buildApp<INS = {}>(ins: INS, router: CoreRouter): INS & {
    render(options?: RenderOptions): Promise<void>;
};
export declare function buildSSR<INS = {}>(ins: INS, router: CoreRouter): INS & {
    render(options?: RenderOptions): Promise<string>;
};
//# sourceMappingURL=app.d.ts.map