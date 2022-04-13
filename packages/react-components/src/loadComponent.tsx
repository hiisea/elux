import React, {Component, ComponentType} from 'react';

import {coreConfig, EluxComponent, env, ILoadComponent, injectComponent, isPromise, IStore} from '@elux/core';

export const LoadComponentOnError: Elux.Component<{message: string}> = ({message}: {message: string}) => (
  <div className="g-component-error">{message}</div>
);
export const LoadComponentOnLoading: Elux.Component = () => <div className="g-component-loading">loading...</div>;

export const LoadComponent: ILoadComponent<any> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading!;
  const OnError = options.onError || coreConfig.LoadComponentOnError!;

  class Loader extends Component<{store: IStore; forwardedRef: any}> {
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
        const {store} = this.props;
        this.loading = true;
        let result: EluxComponent | Promise<EluxComponent> | undefined;
        try {
          result = injectComponent(moduleName as string, componentName as string, store);
          if (env.isServer && isPromise(result)) {
            result = undefined;
            throw 'can not use async component in SSR';
          }
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
      const {forwardedRef, store, ...rest} = this.props;

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
    const store = coreConfig.UseStore!();
    return <Loader {...props} store={store} forwardedRef={ref} />;
  }) as any;
};
