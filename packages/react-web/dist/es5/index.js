import { hydrate, render } from 'react-dom';
import { buildConfigSetter, getEntryComponent, coreConfig, env, injectComponent, isPromise, urlToNativeUrl, setCoreConfig, BaseNativeRouter, exportView, getModuleApiMap, buildApp, buildSSR } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import { createContext, useContext, memo, useState, useRef, useEffect, forwardRef, useMemo, Children, useCallback } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';
import { renderToString } from '@elux/react-web/server';
import { connect, useStore, Provider } from 'react-redux';
export { createSelectorHook, shallowEqual, useSelector } from 'react-redux';

var EluxContextComponent = createContext({
  router: null
});
function UseRouter() {
  var eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
var reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
var setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var Component$2 = function Component(_ref) {
  var store = _ref.store;
  var AppView = getEntryComponent();
  var StoreProvider = coreConfig.StoreProvider;
  return jsx(StoreProvider, {
    store: store,
    children: jsx(AppView, {})
  });
};

Component$2.displayName = 'EluxWindow';
var EWindow = memo(Component$2);

var Component$1 = function Component() {
  var router = coreConfig.UseRouter();

  var _useState = useState({
    className: 'elux-app',
    pages: router.getCurrentPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var className = data.className,
      pages = data.pages;
  var pagesRef = useRef(pages);
  pagesRef.current = pages;
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [pagesRef.current[pagesRef.current.length - 1]])
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              setData({
                className: 'elux-app ' + Date.now(),
                pages: pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              className: 'elux-app ',
              pages: pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            className: 'elux-app',
            pages: pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return jsx("div", {
    ref: containerRef,
    className: className,
    children: pages.map(function (item, index) {
      var store = item.store,
          _item$location = item.location,
          url = _item$location.url,
          classname = _item$location.classname;
      var props = {
        className: "elux-window" + (classname ? ' ' + classname : ''),
        key: store.uid,
        uid: store.uid,
        sid: store.sid,
        url: url,
        style: {
          zIndex: index + 1
        }
      };
      return classname.startsWith('_') ? jsx("article", _extends({}, props, {
        children: jsx(EWindow, {
          store: store
        })
      })) : jsx("div", _extends({}, props, {
        children: jsx(EWindow, {
          store: store
        })
      }));
    })
  });
};

Component$1.displayName = 'EluxRouter';
var RouterComponent = memo(Component$1);

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app) {
    var renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    var panel = env.document.getElementById(id);
    renderFun(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }), panel);
  },
  toString: function toString(id, eluxContext, app) {
    var html = reactComponentsConfig.renderToString(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }));
    return Promise.resolve(html);
  },
  toProvider: function toProvider(eluxContext, app) {
    return function (props) {
      return jsx(EluxContextComponent.Provider, {
        value: eluxContext,
        children: props.children
      });
    };
  }
};

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return jsx("div", {
    className: "g-component-error",
    children: message
  });
};
var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return jsx("div", {
    className: "g-component-loading",
    children: "loading..."
  });
};
var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var Component = forwardRef(function (props, ref) {
    var execute = function execute(curStore) {
      var SyncView = OnLoading;

      try {
        var result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(function (view) {
            activeRef.current && setView(view || 'not found!');
          }, function (e) {
            env.console.error(e);
            activeRef.current && setView(e.message || "" + e || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || "" + e || 'error';
      }

      return SyncView;
    };

    var activeRef = useRef(true);
    useEffect(function () {
      return function () {
        activeRef.current = false;
      };
    }, []);
    var newStore = coreConfig.UseStore();

    var _useState = useState(newStore),
        store = _useState[0],
        setStore = _useState[1];

    var _useState2 = useState(execute),
        View = _useState2[0],
        setView = _useState2[1];

    if (store !== newStore) {
      setStore(newStore);
      setView(execute(newStore));
    }

    if (typeof View === 'string') {
      return jsx(OnError, {
        message: View
      });
    } else if (View === OnLoading) {
      return jsx(OnLoading, {});
    } else {
      return jsx(View, _extends({
        ref: ref
      }, props));
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};

var Component = function Component(_ref) {
  var title = _ref.title,
      html = _ref.html;
  var router = coreConfig.UseRouter();
  var documentHead = useMemo(function () {
    var documentHead = html || '';

    if (title) {
      if (/<title>.*?<\/title>/.test(documentHead)) {
        documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
      } else {
        documentHead = "<title>" + title + "</title>" + documentHead;
      }
    }

    return documentHead;
  }, [html, title]);
  router.setDocumentHead(documentHead);
  return null;
};

Component.displayName = 'EluxDocumentHead';
var DocumentHead = memo(Component);

var Else = function Else(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return jsx(Fragment, {
      children: arr
    });
  }

  return jsx(Fragment, {
    children: elseView
  });
};
Else.displayName = 'EluxElse';

var Switch = function Switch(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return jsx(Fragment, {
      children: arr[0]
    });
  }

  return jsx(Fragment, {
    children: elseView
  });
};
Switch.displayName = 'EluxSwitch';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var _excluded = ["to", "cname", "action", "onClick", "disabled", "overflowRedirect", "target", "refresh"];
var Link = function Link(_ref) {
  var to = _ref.to,
      cname = _ref.cname,
      action = _ref.action,
      onClick = _ref.onClick,
      disabled = _ref.disabled,
      overflowRedirect = _ref.overflowRedirect,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? 'page' : _ref$target,
      refresh = _ref.refresh,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var router = coreConfig.UseRouter();

  var _useMemo = useMemo(function () {
    var firstArg, url, href;

    if (action === 'back') {
      firstArg = to;
      url = "#" + to.toString();
      href = "#";
    } else {
      var location = typeof to === 'string' ? {
        url: to
      } : to;
      cname !== undefined && (location.classname = cname);
      url = router.computeUrl(location, action, target);
      firstArg = location;
      href = urlToNativeUrl(url);
    }

    return {
      firstArg: firstArg,
      url: url,
      href: href
    };
  }, [target, action, cname, router, to]),
      firstArg = _useMemo.firstArg,
      url = _useMemo.url,
      href = _useMemo.href;

  var data = {
    router: router,
    onClick: onClick,
    disabled: disabled,
    firstArg: firstArg,
    action: action,
    target: target,
    refresh: refresh,
    overflowRedirect: overflowRedirect
  };
  var refData = useRef(data);
  Object.assign(refData.current, data);
  var clickHandler = useCallback(function (event) {
    event.preventDefault();
    var _refData$current = refData.current,
        router = _refData$current.router,
        disabled = _refData$current.disabled,
        onClick = _refData$current.onClick,
        firstArg = _refData$current.firstArg,
        action = _refData$current.action,
        target = _refData$current.target,
        refresh = _refData$current.refresh,
        overflowRedirect = _refData$current.overflowRedirect;

    if (!disabled) {
      onClick && onClick(event);
      router[action](firstArg, target, refresh, overflowRedirect);
    }
  }, []);
  props['onClick'] = clickHandler;
  props['action'] = action;
  props['target'] = target;
  props['url'] = url;
  props['href'] = href;
  overflowRedirect && (props['overflow'] = overflowRedirect);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return jsx("span", _extends({}, props));
  } else {
    return jsx("a", _extends({}, props));
  }
};
Link.displayName = 'EluxLink';

setCoreConfig({
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
});

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

setCoreConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory() {
  return {
    url: '',
    push: function push() {
      return;
    },
    replace: function replace() {
      return;
    }
  };
}

function createBrowserHistory() {
  return {
    url: '',
    push: function push(url) {
      this.url = url;
      env.history.pushState(null, '', url);
    },
    replace: function replace(url) {
      this.url = url;
      env.history.replaceState(null, '', url);
    }
  };
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _coreConfig$NotifyNat = coreConfig.NotifyNativeRouter,
        window = _coreConfig$NotifyNat.window,
        page = _coreConfig$NotifyNat.page;

    if ((window || page) && !env.isServer) {
      env.addEventListener('popstate', function () {
        if (history.url) {
          env.history.pushState(null, '', history.url);
          env.setTimeout(function () {
            return _this.router.back(1, 'page');
          }, 0);
        }
      }, true);
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.init = function init(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.push = function push(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.back = function back(location, key, index) {
    this.history.replace(location.url);
    return false;
  };

  _proto.exit = function exit() {
    if (!env.isServer) {
      env.history.go(-2);
    }
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);

function createClientRouter() {
  var history = createBrowserHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
function createServerRouter() {
  var history = createServerHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}

function connectStore(mapStateToProps, options) {
  return function (component) {
    return exportView(connect(mapStateToProps, options)(component));
  };
}
var connectRedux = connectStore;
setCoreConfig({
  UseStore: useStore,
  StoreProvider: Provider
});

var appConfig = Symbol();
function setConfig(conf) {
  setCoreConfig(conf);

  if (conf.DisableNativeRouter) {
    setCoreConfig({
      NotifyNativeRouter: {
        window: false,
        page: false
      }
    });
  }

  return appConfig;
}
function patchActions(typeName, json) {
  if (json) {
    getModuleApiMap(JSON.parse(json));
  }
}

setReactComponentsConfig({
  hydrate: hydrate,
  render: render,
  renderToString: renderToString
});
var cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createClientRouter();
  cientSingleton = {
    render: function render() {
      return Promise.resolve();
    }
  };
  var _ref = env.location,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash;
  return buildApp({}, router, {
    url: [pathname, search, hash].join('')
  });
}
function createSSR(appConfig, routerOptions) {
  var router = createServerRouter();
  return buildSSR({}, router, routerOptions);
}

export { DocumentHead, Else, Link, Switch, connectRedux, connectStore, createApp, createSSR, patchActions, setConfig };
