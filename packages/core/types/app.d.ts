import { CoreRouter } from './store';
export interface RenderOptions {
    /**
     * 挂载 Dom 的 id，默认为 `root`
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