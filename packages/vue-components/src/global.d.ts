declare module '@elux/vue-components/server' {
  export function renderToString(component: any): Promise<string>;
}
