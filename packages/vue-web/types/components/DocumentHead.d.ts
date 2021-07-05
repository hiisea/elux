import { EluxContextType } from '../sington';
export interface Props {
    title?: string;
    html?: string;
}
declare const _default: import("vue").DefineComponent<{
    title: {
        type: StringConstructor;
        default: string;
    };
    html: {
        type: StringConstructor;
        default: string;
    };
}, unknown, {
    eluxContext: EluxContextType;
    raw: string;
}, {
    headText(): string;
}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    title: string;
    html: string;
} & {}>, {
    title: string;
    html: string;
}>;
export default _default;
