import React, {ComponentType, Component} from 'react';
import {loadComponet, isPromise, env} from '@elux/core';
import type {LoadComponent as BaseLoadComponent, RootModuleFacade, IStore, EluxComponent} from '@elux/core';

export const DepsContext = React.createContext<{deps: Record<string, boolean>; store?: IStore}>({deps: {}});
DepsContext.displayName = 'EluxComponentLoader';

export type LoadComponent<A extends RootModuleFacade = {}> = BaseLoadComponent<
  A,
  {OnError?: ComponentType<{message: string}>; OnLoading?: ComponentType<{}>}
>;

const loadComponentDefaultOptions: {LoadComponentOnError: ComponentType<{message: string}>; LoadComponentOnLoading: ComponentType<{}>} = {
  LoadComponentOnError: ({message}) => <div className="g-component-error">{message}</div>,
  LoadComponentOnLoading: () => <div className="g-component-loading">loading...</div>,
};
export function setLoadComponentOptions({
  LoadComponentOnError,
  LoadComponentOnLoading,
}: {
  LoadComponentOnError?: ComponentType<{message: string}>;
  LoadComponentOnLoading?: ComponentType<{}>;
}) {
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}

export const loadComponent: LoadComponent<Record<string, any>> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  const OnError = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;
  class Loader extends Component<{forwardedRef: any}> {
    static contextType = DepsContext;

    private active: boolean = true;

    private loading: boolean = false;

    private error: string = '';

    private view?: EluxComponent;

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
        const {deps, store} = this.context || {};
        this.loading = true;
        let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
        try {
          result = loadComponet(moduleName, componentName as string, store!, deps);
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
                  // eslint-disable-next-line react/no-access-state-in-setstate
                  this.active && this.setState({ver: this.state.ver + 1});
                }
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
