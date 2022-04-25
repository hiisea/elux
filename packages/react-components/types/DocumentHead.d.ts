import React from 'react';
/**
 * 内置UI组件
 *
 * @remarks
 * 以组件的方式维护`<head></head>`标签中的`<title>、<meta>`等不可见元素，可用于服务器环境（SSR）
 *
 * @example
 * ```html
 * <DocumentHead
 *   title='文章'
 *   html='<meta name="keywords" content="域名,域名推广,域名注册">'
 * />
 * ```
 *
 * @public
 */
export interface DocumentHeadProps {
    title?: string;
    html?: string;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link DocumentHeadProps}
 *
 * @public
 */
export declare const DocumentHead: React.NamedExoticComponent<DocumentHeadProps>;
//# sourceMappingURL=DocumentHead.d.ts.map