import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React, { Component } from 'react';
import { loadComponet, isPromise, env } from '@elux/core';
import { EluxContext } from './sington';
const loadComponentDefaultOptions = {
  LoadComponentOnError: ({
    message
  }) => React.createElement("div", {
    className: "g-component-error"
  }, message),
  LoadComponentOnLoading: () => React.createElement("div", {
    className: "g-component-loading"
  }, "loading...")
};
export function setLoadComponentOptions({
  LoadComponentOnError,
  LoadComponentOnLoading
}) {
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}
export const loadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  const OnError = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

  class Loader extends Component {
    constructor(props, context) {
      super(props);

      _defineProperty(this, "active", true);

      _defineProperty(this, "loading", false);

      _defineProperty(this, "error", '');

      _defineProperty(this, "view", void 0);

      _defineProperty(this, "state", {
        ver: 0
      });

      this.context = context;
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
        } = this.context || {};
        this.loading = true;
        let result;

        try {
          result = loadComponet(moduleName, componentName, store, deps || {});
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
        ...rest
      } = this.props;

      if (this.view) {
        const View = this.view;
        return React.createElement(View, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        const Loading = OnLoading;
        return React.createElement(Loading, null);
      }

      return React.createElement(OnError, {
        message: this.error
      });
    }

  }

  _defineProperty(Loader, "contextType", EluxContext);

  return React.forwardRef((props, ref) => {
    return React.createElement(Loader, _extends({}, props, {
      forwardedRef: ref
    }));
  });
};