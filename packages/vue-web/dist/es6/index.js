import { shallowReactive, watch, inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, h, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1, createSSRApp } from 'vue';
import { setCoreConfig, BaseNativeRouter, coreConfig, env, buildConfigSetter, injectComponent, isPromise, getEntryComponent, urlToNativeUrl, getModuleApiMap, buildApp, buildSSR } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import { renderToString } from '@elux/vue-web/server';

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
const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
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

const RouterComponent = defineComponent({
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
        target
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

setVueComponentsConfig({
  renderToString
});
let cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  const router = createClientRouter();
  const app = createApp$1(RouterComponent);
  cientSingleton = Object.assign(app, {
    render() {
      return Promise.resolve();
    }

  });
  const {
    pathname,
    search,
    hash
  } = env.location;
  return buildApp(app, router, {
    url: [pathname, search, hash].join('')
  });
}
function createSSR(appConfig, routerOptions) {
  const router = createServerRouter();
  const app = createSSRApp(RouterComponent);
  return buildSSR(app, router, routerOptions);
}

export { DocumentHead, Else, Link, Switch, connectStore, createApp, createSSR, patchActions, setConfig };
