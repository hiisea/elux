import { createContext, useContext, memo, useState, useRef, useEffect, forwardRef, useMemo, Children, useCallback } from 'react';
import { buildConfigSetter, getEntryComponent, coreConfig, env, injectComponent, isPromise, urlToNativeUrl, setCoreConfig, BaseNativeRouter, nativeUrlToUrl, SingleDispatcher, exportView, getModuleApiMap, buildProvider, getClientRouter, locationToUrl } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import { jsx, Fragment } from 'react/jsx-runtime';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
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
buildConfigSetter(reactComponentsConfig);

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
    page: false
  }
});
class MPNativeRouter extends BaseNativeRouter {
  constructor(history) {
    super();
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = coreConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.onRouteChange(({
        pathname,
        search,
        action
      }) => {
        let key = this.routeKey;

        if (!key) {
          const nativeUrl = [pathname, search].filter(Boolean).join('?');
          const url = nativeUrlToUrl(nativeUrl);

          if (action === 'POP') {
            const arr = `?${search}`.match(/[?&]__k=(\w+)/);
            key = arr ? arr[1] : '';

            if (!key) {
              this.router.back(-1, 'page', undefined, undefined, true);
            } else {
              this.router.back(key, 'page', undefined, undefined, true);
            }
          } else if (action === 'REPLACE') {
            this.router.replace({
              url
            }, 'window', undefined, true);
          } else if (action === 'PUSH') {
            this.router.push({
              url
            }, 'window', undefined, true);
          } else {
            this.router.relaunch({
              url
            }, 'window', undefined, true);
          }
        } else {
          this.onSuccess();
        }
      });
    }
  }

  addKey(url, key) {
    return url.indexOf('?') > -1 ? `${url.replace(/[?&]__k=(\w+)/, '')}&__k=${key}` : `${url}?__k=${key}`;
  }

  init(location, key) {
    return true;
  }

  _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  push(location, key) {
    this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  replace(location, key) {
    this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  relaunch(location, key) {
    if (this.history.isTabPage(location.pathname)) {
      this.history.switchTab({
        url: location.url
      });
    } else {
      this.history.reLaunch({
        url: this.addKey(location.url, key)
      });
    }

    return true;
  }

  back(location, key, index) {
    this.history.navigateBack({
      delta: index[0]
    });
    return true;
  }

  exit() {
    this.history.navigateBack({
      delta: 99
    });
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}
function createRouter(history) {
  const mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}

setCoreConfig({
  SetPageTitle: title => Taro.setNavigationBarTitle({
    title
  })
});
let TaroRouter;
let beforeOnShow;
let tabPages = undefined;
let curLocation;
const eventBus = new SingleDispatcher();

function routeToPathname(route) {
  return `/${route.replace(/^\/+|\/+$/g, '')}`;
}

function queryTosearch(query = {}) {
  const parts = [];
  Object.keys(query).forEach(key => {
    parts.push(`${key}=${query[key]}`);
  });
  return parts.join('&');
}

const taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,

  isTabPage(pathname) {
    if (!tabPages) {
      const tabConfig = env.__taroAppConfig.tabBar;

      if (tabConfig) {
        tabPages = (tabConfig.list || tabConfig.items).reduce((obj, item) => {
          obj[routeToPathname(item.pagePath)] = true;
          return obj;
        }, {});
      } else {
        tabPages = {};
      }
    }

    return !!tabPages[pathname];
  },

  getLocation() {
    if (!curLocation) {
      if (process.env.TARO_ENV === 'h5') {
        TaroRouter.history.listen(({
          location: {
            pathname,
            search
          },
          action
        }) => {
          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }

          curLocation = {
            pathname,
            search: search.replace(/^\?/, ''),
            action
          };
        });
        const {
          pathname,
          search
        } = TaroRouter.history.location;
        curLocation = {
          pathname,
          search: search.replace(/^\?/, ''),
          action: 'RELAUNCH'
        };
      } else {
        const arr = Taro.getCurrentPages();
        let path;
        let query;

        if (arr.length === 0) {
          ({
            path,
            query
          } = Taro.getLaunchOptionsSync());
        } else {
          const current = arr[arr.length - 1];
          path = current.route;
          query = current.options;
        }

        if (!path) {
          return {
            pathname: '',
            search: '',
            action: 'RELAUNCH'
          };
        }

        curLocation = {
          pathname: routeToPathname(path),
          search: queryTosearch(query),
          action: 'RELAUNCH'
        };
      }
    }

    return curLocation;
  },

  onRouteChange(callback) {
    return eventBus.addListener(callback);
  }

};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');

  beforeOnShow = () => undefined;
} else {
  TaroRouter = {};
  let prevPageInfo;

  beforeOnShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    curLocation = {
      pathname: currentPageInfo.pathname,
      search: currentPageInfo.search,
      action: 'RELAUNCH'
    };

    if (prevPageInfo) {
      let action = 'PUSH';

      if (currentPageInfo.count < prevPageInfo.count) {
        action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        if (currentPageInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }

      curLocation.action = action;
    }

    prevPageInfo = {
      count: currentPageInfo.count
    };
  };
}

function onShow() {
  beforeOnShow();
  eventBus.dispatch(taroHistory.getLocation());
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

setCoreConfig({
  Platform: 'taro'
});
const EluxPage = () => {
  const router = coreConfig.UseRouter();
  const [store, setStore] = useState();
  const unlink = useRef();
  useDidShow(() => {
    if (!unlink.current) {
      unlink.current = router.addListener(({
        newStore
      }) => {
        setStore(newStore);
      });
    }

    onShow();
  });
  useDidHide(() => {
    if (unlink.current) {
      unlink.current();
      unlink.current = undefined;
    }
  });
  useEffect(() => {
    return () => {
      if (unlink.current) {
        unlink.current();
        unlink.current = undefined;
      }
    };
  }, []);
  return store ? jsx(EWindow, {
    store: store
  }, store.sid) : jsx("div", {
    className: "g-page-loading",
    children: "Loading..."
  });
};
let cientSingleton;
function createApp(appConfig) {
  if (!cientSingleton) {
    const router = createRouter(taroHistory);
    cientSingleton = buildProvider({}, router);
  }

  const location = taroHistory.getLocation();

  if (location.pathname) {
    const router = getClientRouter();
    router.init({
      url: locationToUrl(location)
    }, {});
  }

  return cientSingleton;
}

export { DocumentHead, Else, EluxPage, Link, Switch, connectRedux, connectStore, createApp, patchActions, setConfig };
