import { shallowReactive, watch, inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, h, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1, createSSRApp } from 'vue';
import { setCoreConfig, coreConfig, env, BaseNativeRouter, buildConfigSetter, injectComponent, isPromise, getEntryComponent, urlToNativeUrl, getModuleApiMap, buildApp, buildSSR } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import { renderToString } from '@elux/vue-web/server';

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

var EluxContextKey = '__EluxContext__';
var EluxStoreContextKey = '__EluxStoreContext__';
function UseRouter() {
  var _inject = inject(EluxContextKey, {}),
      router = _inject.router;

  return router;
}
function UseStore() {
  var _inject2 = inject(EluxStoreContextKey, {}),
      store = _inject2.store;

  return store;
}
var vueComponentsConfig = {
  renderToString: undefined
};
var setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
function connectStore(mapStateToProps) {
  if (mapStateToProps === void 0) {
    mapStateToProps = function mapStateToProps() {
      return {};
    };
  }

  var store = UseStore();
  var storeProps = shallowReactive({});
  watch(function () {
    return mapStateToProps(store.state);
  }, function (val) {
    return Object.assign(storeProps, val, {
      dispatch: store.dispatch
    });
  }, {
    immediate: true
  });
  return storeProps;
}

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount("#" + id);
  },
  toString: function toString(id, eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },
  toProvider: function toProvider(eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return function () {
      return createVNode("div", null, null);
    };
  }
};

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return createVNode("div", {
    "class": "g-component-error"
  }, [message]);
};
var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return createVNode("div", {
    "class": "g-component-loading"
  }, [createTextVNode("loading...")]);
};
var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var component = defineComponent({
    name: 'EluxComponentLoader',
    setup: function setup(props, context) {
      var execute = function execute() {
        var SyncView = OnLoading;

        try {
          var result = injectComponent(moduleName, componentName, store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(function (view) {
              active && (View.value = view || 'not found!');
            }, function (e) {
              env.console.error(e);
              active && (View.value = e.message || "" + e || 'error');
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

      var store = coreConfig.UseStore();
      var View = shallowRef(execute());
      var active = true;
      onBeforeUnmount(function () {
        active = false;
      });
      watch(function () {
        return store.sid;
      }, execute);
      return function () {
        var view = View.value;

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

var EWindow = defineComponent({
  name: 'EluxWindow',
  props: ['store'],
  setup: function setup(props) {
    var AppView = getEntryComponent();
    var store = props.store;
    var uid = store.uid,
        sid = store.sid,
        state = store.state,
        dispatch = store.dispatch,
        mount = store.mount;
    var storeRef = shallowReactive({
      uid: uid,
      sid: sid,
      state: state,
      dispatch: dispatch.bind(store),
      mount: mount.bind(store)
    });
    var storeContext = {
      store: storeRef
    };
    provide(EluxStoreContextKey, storeContext);
    watch(function () {
      return props.store;
    }, function (store) {
      var uid = store.uid,
          sid = store.sid,
          state = store.state,
          dispatch = store.dispatch;
      Object.assign(storeRef, {
        uid: uid,
        sid: sid,
        state: state,
        dispatch: dispatch.bind(store),
        mount: mount.bind(store)
      });
    });
    return function () {
      return h(AppView, null);
    };
  }
});

var RouterComponent = defineComponent({
  name: 'EluxRouter',
  setup: function setup() {
    var router = coreConfig.UseRouter();
    var data = shallowRef({
      className: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = ref({
      className: ''
    });
    var removeListener = router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages: pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages: pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
            pages: pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          className = _data$value.className,
          pages = _data$value.pages;
      return createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map(function (item, index) {
        var store = item.store,
            _item$location = item.location,
            url = _item$location.url,
            classname = _item$location.classname;
        var props = {
          class: "elux-window" + (classname ? ' ' + classname : ''),
          key: store.uid,
          uid: store.uid,
          sid: store.sid,
          url: url,
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

var DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],
  setup: function setup(props) {
    var documentHead = computed(function () {
      var documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + props.title + "</title>");
        } else {
          documentHead = "<title>" + props.title + "</title>" + documentHead;
        }
      }

      return documentHead;
    });
    var router = coreConfig.UseRouter();
    return function () {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  }
});

var Switch = function Switch(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
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

var Else = function Else(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
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

var Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'refresh', 'cname', 'overflowRedirect'],
  setup: function setup(props, context) {
    var router = coreConfig.UseRouter();
    var route = computed(function () {
      var firstArg, url, href;
      var to = props.to,
          action = props.action,
          cname = props.cname,
          target = props.target;

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
    });

    var clickHandler = function clickHandler(event) {
      event.preventDefault();
      var firstArg = route.value.firstArg;
      var disabled = props.disabled,
          onClick = props.onClick,
          action = props.action,
          target = props.target,
          refresh = props.refresh,
          overflowRedirect = props.overflowRedirect;

      if (!disabled) {
        onClick && onClick(event);
        router[action](firstArg, target, refresh, overflowRedirect);
      }
    };

    return function () {
      var _route$value = route.value,
          url = _route$value.url,
          href = _route$value.href;
      var disabled = props.disabled,
          action = props.action,
          target = props.target,
          overflowRedirect = props.overflowRedirect;
      var linkProps = {};
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
  StoreInitState: function StoreInitState() {
    return reactive({});
  },
  UseStore: UseStore,
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
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

setVueComponentsConfig({
  renderToString: renderToString
});
var cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createClientRouter();
  var app = createApp$1(RouterComponent);
  cientSingleton = Object.assign(app, {
    render: function render() {
      return Promise.resolve();
    }
  });
  var _ref = env.location,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash;
  return buildApp(app, router, {
    url: [pathname, search, hash].join('')
  });
}
function createSSR(appConfig, routerOptions) {
  var router = createServerRouter();
  var app = createSSRApp(RouterComponent);
  return buildSSR(app, router, routerOptions);
}

export { DocumentHead, Else, Link, Switch, connectStore, createApp, createSSR, patchActions, setConfig };
