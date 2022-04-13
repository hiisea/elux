import React, { Component } from 'react';
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export const LoadComponentOnError = ({
  message
}) => _jsx("div", {
  className: "g-component-error",
  children: message
});
export const LoadComponentOnLoading = () => _jsx("div", {
  className: "g-component-loading",
  children: "loading..."
});
export const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;

  class Loader extends Component {
    constructor(props) {
      super(props);
      this.active = true;
      this.loading = false;
      this.error = '';
      this.view = void 0;
      this.state = {
        ver: 0
      };
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
        const {
          store
        } = this.props;
        this.loading = true;
        let result;

        try {
          result = injectComponent(moduleName, componentName, store);

          if (env.isServer && isPromise(result)) {
            result = undefined;
            throw 'can not use async component in SSR';
          }
        } catch (e) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(view => {
              if (view) {
                this.loading = false;
                this.view = view;
                this.active && this.setState({
                  ver: this.state.ver + 1
                });
              }
            }, e => {
              env.console.error(e);
              this.loading = false;
              this.error = e.message || `${e}` || 'error';
              this.active && this.setState({
                ver: this.state.ver + 1
              });
            });
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    }

    render() {
      const {
        forwardedRef,
        store,
        ...rest
      } = this.props;

      if (this.view) {
        const View = this.view;
        return _jsx(View, {
          ref: forwardedRef,
          ...rest
        });
      }

      if (this.loading) {
        const Loading = OnLoading;
        return _jsx(Loading, {});
      }

      return _jsx(OnError, {
        message: this.error
      });
    }

  }

  return React.forwardRef((props, ref) => {
    const store = coreConfig.UseStore();
    return _jsx(Loader, { ...props,
      store: store,
      forwardedRef: ref
    });
  });
};