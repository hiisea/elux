import {hydrate, render} from 'react-dom';

import {env, getEntryComponent, IAppRender} from '@elux/core';
// eslint-disable-next-line
import {renderToString} from '@elux/react-components/server';

import {EluxContextComponent} from './base';
import {RouterComponent} from './Router';

const AppRender: IAppRender = {
  toDocument(id, eluxContext, fromSSR, app, store): void {
    const renderFun = fromSSR ? hydrate : render;
    const panel = env.document!.getElementById(id);
    const appView: Elux.Component = getEntryComponent() as any;
    renderFun(
      <EluxContextComponent.Provider value={eluxContext}>
        <RouterComponent page={appView} />
      </EluxContextComponent.Provider>,
      panel
    );
  },
  toString(id, eluxContext, app, store): Promise<string> {
    const appView: Elux.Component = getEntryComponent() as any;
    const html = renderToString(
      <EluxContextComponent.Provider value={eluxContext}>
        <RouterComponent page={appView} />
      </EluxContextComponent.Provider>
    );
    return Promise.resolve(html);
  },
};

export default AppRender;

// export function renderToMP(eluxContext: EluxContext): ComponentType<any> {
//   const Component: React.FC = ({children}) => <EluxContextComponent.Provider value={eluxContext}>{children}</EluxContextComponent.Provider>;
//   return Component;
// }
