import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React, { Component } from 'react';
import { getComponet, isPromise, env, config } from '@elux/core';
export const DepsContext = React.createContext({});
DepsContext.displayName = 'EluxComponentLoader';
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
export const loadComponent = (moduleName, viewName, options) => {
  const {
    OnLoading,
    OnError
  } = options || {};

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
        const deps = this.context || {};
        deps[moduleName + config.NSP + viewName] = true;
        this.loading = true;
        let result;

        try {
          result = getComponet(moduleName, viewName, true);
        } catch (e) {
          this.loading = false;
          this.error = e.message || `${e}`;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(view => {
              this.loading = false;
              this.view = view;
              this.active && this.setState({
                ver: this.state.ver + 1
              });
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
        return React.createElement(this.view, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        const Comp = OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
        return React.createElement(Comp, null);
      }

      const Comp = OnError || loadComponentDefaultOptions.LoadComponentOnError;
      return React.createElement(Comp, {
        message: this.error
      });
    }

  }

  _defineProperty(Loader, "contextType", DepsContext);

  return React.forwardRef((props, ref) => {
    return React.createElement(Loader, _extends({}, props, {
      forwardedRef: ref
    }));
  });
};