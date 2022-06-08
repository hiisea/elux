import {env, IAppRender} from '@elux/core';
import {EluxContextComponent, reactComponentsConfig} from './base';
import {RouterComponent} from './Router';

const AppRender: IAppRender = {
  toDocument(id, eluxContext, fromSSR, app): void {
    const renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    const panel = env.document!.getElementById(id);
    renderFun!(
      <EluxContextComponent.Provider value={eluxContext}>
        <RouterComponent />
      </EluxContextComponent.Provider>,
      panel
    );
  },
  toString(id, eluxContext, app): Promise<string> {
    const html = reactComponentsConfig.renderToString!(
      <EluxContextComponent.Provider value={eluxContext}>
        <RouterComponent />
      </EluxContextComponent.Provider>
    );
    return Promise.resolve(html);
  },
  toProvider(eluxContext, app): Elux.Component<{children: any}> {
    return (props) => <EluxContextComponent.Provider value={eluxContext}>{props.children}</EluxContextComponent.Provider>;
  },
};

export default AppRender;
