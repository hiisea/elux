declare module '@elux/vue-web/server' {
  export function renderToString(component: any): Promise<string>;
}
