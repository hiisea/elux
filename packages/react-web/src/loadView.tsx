import React, {ComponentType, Component} from 'react';
import {getComponet, isPromise, env, config} from '@elux/core';
import type {LoadComponent as BaseLoadComponent, RootModuleFacade} from '@elux/core';

export const DepsContext = React.createContext({});
DepsContext.displayName = 'EluxComponentLoader';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadComponent<
  A,
  {OnError?: ComponentType<{message: string}>; OnLoading?: ComponentType<{}>}
>;

const loadViewDefaultOptions: {LoadViewOnError: ComponentType<{message: string}>; LoadViewOnLoading: ComponentType<{}>} = {
  LoadViewOnError: ({message}) => <div className="g-view-error">{message}</div>,
  LoadViewOnLoading: () => <div className="g-view-loading">loading...</div>,
};
export function setLoadViewOptions({
  LoadViewOnError,
  LoadViewOnLoading,
}: {
  LoadViewOnError?: ComponentType<{message: string}>;
  LoadViewOnLoading?: ComponentType<{}>;
}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}

export const loadView: LoadView<Record<string, any>> = (moduleName, viewName, options) => {
  const {OnLoading, OnError} = options || {};
  class Loader extends Component<{forwardedRef: any}> {
    static contextType = DepsContext;

    private active: boolean = true;

    private loading: boolean = false;

    private error: string = '';

    private view?: ComponentType<any>;

    state = {
      ver: 0,
    };

    constructor(props: any, public context: React.ContextType<typeof DepsContext>) {
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
        const deps = this.context || {};
        deps[moduleName + config.CSP + viewName] = true;
        this.loading = true;
        let result: ComponentType<any> | Promise<ComponentType<any>> | undefined;
        try {
          result = getComponet<ComponentType<any>>(moduleName, viewName as string, true);
        } catch (e: any) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }
        if (result) {
          if (isPromise(result)) {
            result.then(
              (view) => {
                this.loading = false;
                this.view = view;
                // eslint-disable-next-line react/no-access-state-in-setstate
                this.active && this.setState({ver: this.state.ver + 1});
              },
              (e) => {
                env.console.error(e);
                this.loading = false;
                this.error = e.message || `${e}` || 'error';
                // eslint-disable-next-line react/no-access-state-in-setstate
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
        return <this.view ref={forwardedRef} {...rest} />;
      }
      if (this.loading) {
        const Comp = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
        return <Comp />;
      }
      const Comp = OnError || loadViewDefaultOptions.LoadViewOnError;
      return <Comp message={this.error} />;
    }
  }
  return React.forwardRef((props, ref) => {
    return <Loader {...props} forwardedRef={ref} />;
  }) as any;
};
