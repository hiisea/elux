import { shallowReactive, watch, inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, h, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1 } from 'vue';
import { setCoreConfig, BaseNativeRouter, coreConfig, nativeUrlToUrl, SingleDispatcher, env, buildConfigSetter, injectComponent, isPromise, getEntryComponent, urlToNativeUrl, getModuleApiMap, locationToUrl, buildProvider } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';

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
      if (this.history.getLocation().pathname === location.pathname) {
        return false;
      }

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

const EluxContextKey = '__EluxContext__';
const EluxStoreContextKey = '__EluxStoreContext__';
function UseRouter() {
  const {
    router
  } = inject(EluxContextKey, {});
  return router;
}
function UseStore() {
  const {
    store
  } = inject(EluxStoreContextKey, {});
  return store;
}
const vueComponentsConfig = {
  renderToString: undefined
};
buildConfigSetter(vueComponentsConfig);
function connectStore(mapStateToProps = () => ({})) {
  const store = UseStore();
  const storeProps = shallowReactive({});
  watch(() => mapStateToProps(store.state), val => Object.assign(storeProps, val, {
    dispatch: store.dispatch
  }), {
    immediate: true
  });
  return storeProps;
}

const AppRender = {
  toDocument(id, eluxContext, fromSSR, app) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount(`#${id}`);
  },

  toString(id, eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },

  toProvider(eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return () => createVNode("div", null, null);
  }

};

const LoadComponentOnError = ({
  message
}) => createVNode("div", {
  "class": "g-component-error"
}, [message]);
const LoadComponentOnLoading = () => createVNode("div", {
  "class": "g-component-loading"
}, [createTextVNode("loading...")]);
const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;
  const component = defineComponent({
    name: 'EluxComponentLoader',

    setup(props, context) {
      const execute = () => {
        let SyncView = OnLoading;

        try {
          const result = injectComponent(moduleName, componentName, store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(view => {
              active && (View.value = view || 'not found!');
            }, e => {
              env.console.error(e);
              active && (View.value = e.message || `${e}` || 'error');
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

      const store = coreConfig.UseStore();
      const View = shallowRef(execute());
      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      watch(() => store.sid, execute);
      return () => {
        const view = View.value;

        if (typeof view === 'string') {
          return h(OnError, {
            message: view
          });
        } else if (view === OnLoading) {
          return h(view);
        } else {
          return h(view, props, context.slots);
        }
      };
    }

  });
  return component;
};

const EWindow = defineComponent({
  name: 'EluxWindow',
  props: ['store'],

  setup(props) {
    const AppView = getEntryComponent();
    const store = props.store;
    const {
      uid,
      sid,
      state,
      dispatch,
      mount
    } = store;
    const storeRef = shallowReactive({
      uid,
      sid,
      state,
      dispatch: dispatch.bind(store),
      mount: mount.bind(store)
    });
    const storeContext = {
      store: storeRef
    };
    provide(EluxStoreContextKey, storeContext);
    watch(() => props.store, store => {
      const {
        uid,
        sid,
        state,
        dispatch
      } = store;
      Object.assign(storeRef, {
        uid,
        sid,
        state,
        dispatch: dispatch.bind(store),
        mount: mount.bind(store)
      });
    });
    return () => h(AppView, null);
  }

});

defineComponent({
  name: 'EluxRouter',

  setup() {
    const router = coreConfig.UseRouter();
    const data = shallowRef({
      className: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getCurrentPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              className: 'elux-app ' + Date.now(),
              pages: [...pages, data.value.pages[data.value.pages.length - 1]]
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
            pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {
        className,
        pages
      } = data.value;
      return createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map((item, index) => {
        const {
          store,
          location: {
            url,
            classname
          }
        } = item;
        const props = {
          class: `elux-window${classname ? ' ' + classname : ''}`,
          key: store.uid,
          uid: store.uid,
          sid: store.sid,
          url,
          style: {
            zIndex: index + 1
          }
        };
        return classname.startsWith('_') ? createVNode("article", props, [createVNode(EWindow, {
          "store": store
        }, null)]) : createVNode("div", props, [createVNode(EWindow, {
          "store": store
        }, null)]);
      })]);
    };
  }

});

const DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],

  setup(props) {
    const documentHead = computed(() => {
      let documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${props.title}</title>`);
        } else {
          documentHead = `<title>${props.title}</title>` + documentHead;
        }
      }

      return documentHead;
    });
    const router = coreConfig.UseRouter();
    return () => {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  }

});

const Switch = function (props, context) {
  const arr = [];
  const children = context.slots.default ? context.slots.default() : [];
  children.forEach(item => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return h(Fragment, null, [arr[0]]);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};
Switch.displayName = 'EluxSwitch';

const Else = function (props, context) {
  const arr = [];
  const children = context.slots.default ? context.slots.default() : [];
  children.forEach(item => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return h(Fragment, null, arr);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};
Else.displayName = 'EluxElse';

const Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'refresh', 'cname', 'overflowRedirect'],

  setup(props, context) {
    const router = coreConfig.UseRouter();
    const route = computed(() => {
      let firstArg, url, href;
      const {
        to,
        action,
        cname,
        target = 'page'
      } = props;

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
    });

    const clickHandler = event => {
      event.preventDefault();
      const {
        firstArg
      } = route.value;
      const {
        disabled,
        onClick,
        action,
        target,
        refresh,
        overflowRedirect
      } = props;

      if (!disabled) {
        onClick && onClick(event);
        router[action](firstArg, target, refresh, overflowRedirect);
      }
    };

    return () => {
      const {
        url,
        href
      } = route.value;
      const {
        disabled,
        action,
        target,
        overflowRedirect
      } = props;
      const linkProps = {};
      linkProps['onClick'] = clickHandler;
      linkProps['action'] = action;
      linkProps['target'] = target;
      linkProps['url'] = url;
      linkProps['href'] = href;
      overflowRedirect && (linkProps['overflow'] = overflowRedirect);
      disabled && (linkProps['disabled'] = true);

      if (coreConfig.Platform === 'taro') {
        return h('span', linkProps, context.slots);
      } else {
        return h('a', linkProps, context.slots);
      }
    };
  }

});

setCoreConfig({
  MutableData: true,
  StoreInitState: () => reactive({}),
  UseStore,
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading
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
const EluxPage = defineComponent({
  setup() {
    const router = coreConfig.UseRouter();
    const store = ref();
    let unlink;
    useDidShow(() => {
      if (!unlink) {
        unlink = router.addListener(({
          newStore
        }) => {
          store.value = newStore;
        });
      }

      onShow();
    });
    useDidHide(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    onBeforeUnmount(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    return () => store.value ? createVNode(EWindow, {
      "store": store.value,
      "key": store.value.sid
    }, null) : createVNode("div", {
      "className": "g-page-loading"
    }, [createTextVNode("Loading...")]);
  }

});
let cientSingleton;
function createApp(appConfig, appOptions = {}) {
  if (!cientSingleton) {
    const onLaunch = appOptions.onLaunch;

    appOptions.onLaunch = function (options) {
      const location = taroHistory.getLocation();
      router.init({
        url: locationToUrl(location)
      }, {});
      onLaunch && onLaunch(options);
    };

    cientSingleton = createApp$1(appOptions);
    const router = createRouter(taroHistory);
    buildProvider(cientSingleton, router);
  }

  return cientSingleton;
}

export { DocumentHead, Else, EluxPage, Link, Switch, connectStore, createApp, patchActions, setConfig };
