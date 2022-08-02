import { hydrate, render } from 'react-dom';
import { buildConfigSetter, getEntryComponent, coreConfig, env, injectComponent, isPromise, urlToNativeUrl, setCoreConfig, BaseNativeRouter, exportView, getModuleApiMap, buildApp, buildSSR } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import { createContext, useContext, memo, useState, useRef, useEffect, forwardRef, useMemo, Children, useCallback } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';
import { renderToString } from '@elux/react-web/server';
import { connect, useStore, Provider } from 'react-redux';
export { createSelectorHook, shallowEqual, useSelector } from 'react-redux';

const EluxContextComponent = createContext({
  router: null
});
function UseRouter() {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
const reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);

const Component$2 = function ({
  store
}) {
  const AppView = getEntryComponent();
  const StoreProvider = coreConfig.StoreProvider;
  return jsx(StoreProvider, {
    store: store,
    children: jsx(AppView, {})
  });
};

Component$2.displayName = 'EluxWindow';
const EWindow = memo(Component$2);

const Component$1 = () => {
  const router = coreConfig.UseRouter();
  const [data, setData] = useState({
    className: 'elux-app',
    pages: router.getCurrentPages().reverse()
  });
  const {
    className,
    pages
  } = data;
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const containerRef = useRef(null);
  useEffect(() => {
    return router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getCurrentPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages
            });
            env.setTimeout(() => {
              containerRef.current.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(() => {
              containerRef.current.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({
              className: 'elux-app ' + Date.now(),
              pages: [...pages, pagesRef.current[pagesRef.current.length - 1]]
            });
            env.setTimeout(() => {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              setData({
                className: 'elux-app ' + Date.now(),
                pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              className: 'elux-app ',
              pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            className: 'elux-app',
            pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return jsx("div", {
    ref: containerRef,
    className: className,
    children: pages.map((item, index) => {
      const {
        store,
        location: {
          url,
          classname
        }
      } = item;
      const props = {
        className: `elux-window${classname ? ' ' + classname : ''}`,
        key: store.uid,
        uid: store.uid,
        sid: store.sid,
        url,
        style: {
          zIndex: index + 1
        }
      };
      return classname.startsWith('_') ? jsx("article", { ...props,
        children: jsx(EWindow, {
          store: store
        })
      }) : jsx("div", { ...props,
        children: jsx(EWindow, {
          store: store
        })
      });
    })
  });
};

Component$1.displayName = 'EluxRouter';
const RouterComponent = memo(Component$1);

const AppRender = {
  toDocument(id, eluxContext, fromSSR, app) {
    const renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    const panel = env.document.getElementById(id);
    renderFun(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }), panel);
  },

  toString(id, eluxContext, app) {
    const html = reactComponentsConfig.renderToString(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }));
    return Promise.resolve(html);
  },

  toProvider(eluxContext, app) {
    return props => jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: props.children
    });
  }

};

const LoadComponentOnError = ({
  message
}) => jsx("div", {
  className: "g-component-error",
  children: message
});
const LoadComponentOnLoading = () => jsx("div", {
  className: "g-component-loading",
  children: "loading..."
});
const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;
  const Component = forwardRef((props, ref) => {
    const execute = curStore => {
      let SyncView = OnLoading;

      try {
        const result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(view => {
            activeRef.current && setView(view || 'not found!');
          }, e => {
            env.console.error(e);
            activeRef.current && setView(e.message || `${e}` || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || `${e}` || 'error';
      }

      return SyncView;
    };

    const activeRef = useRef(true);
    useEffect(() => {
      return () => {
        activeRef.current = false;
      };
    }, []);
    const newStore = coreConfig.UseStore();
    const [store, setStore] = useState(newStore);
    const [View, setView] = useState(execute);

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
      return jsx(View, {
        ref: ref,
        ...props
      });
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};

const Component = ({
  title,
  html
}) => {
  const router = coreConfig.UseRouter();
  const documentHead = useMemo(() => {
    let documentHead = html || '';

    if (title) {
      if (/<title>.*?<\/title>/.test(documentHead)) {
        documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      } else {
        documentHead = `<title>${title}</title>` + documentHead;
      }
    }

    return documentHead;
  }, [html, title]);
  router.setDocumentHead(documentHead);
  return null;
};

Component.displayName = 'EluxDocumentHead';
const DocumentHead = memo(Component);

const Else = ({
  children,
  elseView
}) => {
  const arr = [];
  Children.forEach(children, item => {
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

const Switch = ({
  children,
  elseView
}) => {
  const arr = [];
  Children.forEach(children, item => {
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

const Link = ({
  to,
  cname,
  action,
  onClick,
  disabled,
  overflowRedirect,
  target,
  refresh,
  ...props
}) => {
  const router = coreConfig.UseRouter();
  const {
    firstArg,
    url,
    href
  } = useMemo(() => {
    let firstArg, url, href;

    if (action === 'back') {
      firstArg = to;
      url = `#${to.toString()}`;
      href = `#`;
    } else {
      const location = typeof to === 'string' ? {
        url: to
      } : to;
      cname !== undefined && (location.classname = cname);
      url = router.computeUrl(location, action, target);
      firstArg = location;
      href = urlToNativeUrl(url);
    }

    return {
      firstArg,
      url,
      href
    };
  }, [target, action, cname, router, to]);
  const data = {
    router,
    onClick,
    disabled,
    firstArg,
    action,
    target,
    refresh,
    overflowRedirect
  };
  const refData = useRef(data);
  Object.assign(refData.current, data);
  const clickHandler = useCallback(event => {
    event.preventDefault();
    const {
      router,
      disabled,
      onClick,
      firstArg,
      action,
      target,
      refresh,
      overflowRedirect
    } = refData.current;

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
    return jsx("span", { ...props
    });
  } else {
    return jsx("a", { ...props
    });
  }
};
Link.displayName = 'EluxLink';

setCoreConfig({
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading
});

setCoreConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory() {
  return {
    url: '',

    push() {
      return;
    },

    replace() {
      return;
    }

  };
}

function createBrowserHistory() {
  return {
    url: '',

    push(url) {
      this.url = url;
      env.history.pushState(null, '', url);
    },

    replace(url) {
      this.url = url;
      env.history.replaceState(null, '', url);
    }

  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  constructor(history) {
    super();
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = coreConfig.NotifyNativeRouter;

    if ((window || page) && !env.isServer) {
      env.addEventListener('popstate', () => {
        if (history.url) {
          env.history.pushState(null, '', history.url);
          env.setTimeout(() => this.router.back(1, 'page'), 0);
        }
      }, true);
    }
  }

  init(location, key) {
    this.history.push(location.url);
    return false;
  }

  push(location, key) {
    this.history.replace(location.url);
    return false;
  }

  replace(location, key) {
    this.history.replace(location.url);
    return false;
  }

  relaunch(location, key) {
    this.history.replace(location.url);
    return false;
  }

  back(location, key, index) {
    this.history.replace(location.url);
    return false;
  }

  exit() {
    if (!env.isServer) {
      env.history.go(-2);
    }
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}

function createClientRouter() {
  const history = createBrowserHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
function createServerRouter() {
  const history = createServerHistory();
  const browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}

function connectStore(mapStateToProps, options) {
  return function (component) {
    return exportView(connect(mapStateToProps, options)(component));
  };
}
const connectRedux = connectStore;
setCoreConfig({
  UseStore: useStore,
  StoreProvider: Provider
});

const appConfig = Symbol();
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
  hydrate,
  render,
  renderToString
});
let cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  const router = createClientRouter();
  cientSingleton = {
    render() {
      return Promise.resolve();
    }

  };
  const {
    pathname,
    search,
    hash
  } = env.location;
  return buildApp({}, router, {
    url: [pathname, search, hash].join('')
  });
}
function createSSR(appConfig, routerOptions) {
  const router = createServerRouter();
  return buildSSR({}, router, routerOptions);
}

export { DocumentHead, Else, Link, Switch, connectRedux, connectStore, createApp, createSSR, patchActions, setConfig };
