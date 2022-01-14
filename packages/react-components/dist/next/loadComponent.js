import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React, { Component, useContext } from 'react';
import { env, loadComponet, isPromise } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { jsx as _jsx } from "react/jsx-runtime";

const loadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.OnLoading || reactComponentsConfig.LoadComponentOnLoading;
  const OnError = options.OnError || reactComponentsConfig.LoadComponentOnError;

  class Loader extends Component {
    constructor(props) {
      super(props);

      _defineProperty(this, "active", true);

      _defineProperty(this, "loading", false);

      _defineProperty(this, "error", '');

      _defineProperty(this, "view", void 0);

      _defineProperty(this, "state", {
        ver: 0
      });

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
          deps,
          store
        } = this.props;
        this.loading = true;
        let result;

        try {
          result = loadComponet(moduleName, componentName, store, deps);
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
        deps,
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
    const {
      deps = {}
    } = useContext(EluxContextComponent);
    const store = reactComponentsConfig.useStore();
    return _jsx(Loader, { ...props,
      store: store,
      deps: deps,
      forwardedRef: ref
    });
  });
};

export default loadComponent;