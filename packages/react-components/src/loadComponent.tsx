import React, {ComponentType, Component, useContext} from 'react';
import {env, loadComponet, isPromise, LoadComponent, EluxComponent, IStore} from '@elux/core';
import {EluxContextComponent, reactComponentsConfig} from './base';

/*** @public */
export interface LoadComponentOptions {
  OnError?: ComponentType<{message: string}>;
  OnLoading?: ComponentType<{}>;
}

/*** @internal */
const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.OnLoading || reactComponentsConfig.LoadComponentOnLoading;
  const OnError = options.OnError || reactComponentsConfig.LoadComponentOnError;

  class Loader extends Component<{store: IStore; deps: Record<string, boolean>; forwardedRef: any}> {
    private active = true;

    private loading = false;

    private error = '';

    private view?: EluxComponent;

    state = {
      ver: 0,
    };

    constructor(props: any) {
      super(props);
      this.execute();
    }

    componentWillUnmount() {
      this.active = false;
    }

    shouldComponentUpdate() {
      this.execute();
      return true;
    }

    componentDidMount() {
      this.error = '';
    }

    execute() {
      if (!this.view && !this.loading && !this.error) {
        const {deps, store} = this.props;
        this.loading = true;
        let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
        try {
          result = loadComponet(moduleName, componentName as string, store, deps);
        } catch (e: any) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }
        if (result) {
          if (isPromise(result)) {
            result.then(
              (view) => {
                if (view) {
                  this.loading = false;
                  this.view = view;
                  this.active && this.setState({ver: this.state.ver + 1});
                }
              },
              (e) => {
                env.console.error(e);
                this.loading = false;
                this.error = e.message || `${e}` || 'error';
                this.active && this.setState({ver: this.state.ver + 1});
              }
            );
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    }

    render() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {forwardedRef, deps, store, ...rest} = this.props;

      if (this.view) {
        const View: ComponentType<any> = this.view as any;
        return <View ref={forwardedRef} {...rest} />;
      }
      if (this.loading) {
        const Loading: ComponentType<any> = OnLoading as any;
        return <Loading />;
      }
      return <OnError message={this.error} />;
    }
  }
  return React.forwardRef((props, ref) => {
    const {deps = {}} = useContext(EluxContextComponent);
    const store = reactComponentsConfig.useStore();
    return <Loader {...props} store={store} deps={deps} forwardedRef={ref} />;
  }) as any;
};

export default loadComponent;
