import React from 'react';
/**
 * 内置UI组件
 *
 * @remarks
 * 用组件的方式动态修改`<head>内容`，主要是`title/description/keywords`等meta信息，SSR中非常有用
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