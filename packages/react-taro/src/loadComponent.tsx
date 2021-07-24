import React, {ComponentType, Component} from 'react';
import {View} from '@tarojs/components';
import {loadComponet, isPromise, env} from '@elux/core';
import type {LoadComponent as BaseLoadComponent, RootModuleFacade, EluxComponent} from '@elux/core';
import {EluxContext} from './sington';

export type LoadComponent<A extends RootModuleFacade = {}> = BaseLoadComponent<
  A,
  {OnError?: ComponentType<{message: string}>; OnLoading?: ComponentType<{}>}
>;
const loadComponentDefaultOptions: {LoadComponentOnError: ComponentType<{message: string}>; LoadComponentOnLoading: ComponentType<{}>} = {
  LoadComponentOnError: ({message}) => <View className="g-component-error">{message}</View>,
  LoadComponentOnLoading: () => <View className="g-component-loading">loading...</View>,
};
export function setLoadComponentOptions({
  LoadComponentOnError,
  LoadComponentOnLoading,
}: {
  LoadComponentOnError?: ComponentType<{message: string}>;
  LoadComponentOnLoading?: ComponentType<{}>;
}): void {
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}

export const loadComponent: LoadComponent<Record<string, any>> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  const OnError = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;
  class Loader extends Component<{forwardedRef: any}> {
    static contextType = EluxContext;

    private active = true;

    private loading = false;

    private error = '';

    private view?: EluxComponent;

    state = {
      ver: 0,
    };

    constructor(props: any, public context: React.ContextType<typeof EluxContext>) {
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
        const {store} = this.context || {};
        this.loading = true;
        let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
        try {
          result = loadComponet(moduleName, componentName as string, store!, {});
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
      const {forwardedRef, ...rest} = this.props;

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
    return <Loader {...props} forwardedRef={ref} />;
  }) as any;
};