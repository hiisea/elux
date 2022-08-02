import { shallowReactive, watch, inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, h, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1 } from 'vue';
import { setCoreConfig, coreConfig, nativeUrlToUrl, BaseNativeRouter, SingleDispatcher, env, buildConfigSetter, injectComponent, isPromise, getEntryComponent, urlToNativeUrl, getModuleApiMap, locationToUrl, buildProvider } from '@elux/core';
export { BaseModel, EmptyModel, ErrorCodes, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isMutable, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setLoading, urlToLocation, urlToNativeUrl } from '@elux/core';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';

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
    page: false
  }
});
var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _coreConfig$NotifyNat = coreConfig.NotifyNativeRouter,
        window = _coreConfig$NotifyNat.window,
        page = _coreConfig$NotifyNat.page;

    if (window || page) {
      _this.unlistenHistory = history.onRouteChange(function (_ref) {
        var pathname = _ref.pathname,
            search = _ref.search,
            action = _ref.action;
        var key = _this.routeKey;

        if (!key) {
          var nativeUrl = [pathname, search].filter(Boolean).join('?');
          var url = nativeUrlToUrl(nativeUrl);

          if (action === 'POP') {
            var arr = ("?" + search).match(/[?&]__k=(\w+)/);
            key = arr ? arr[1] : '';

            if (!key) {
              _this.router.back(-1, 'page', undefined, undefined, true);
            } else {
              _this.router.back(key, 'page', undefined, undefined, true);
            }
          } else if (action === 'REPLACE') {
            _this.router.replace({
              url: url
            }, 'window', undefined, true);
          } else if (action === 'PUSH') {
            _this.router.push({
              url: url
            }, 'window', undefined, true);
          } else {
            _this.router.relaunch({
              url: url
            }, 'window', undefined, true);
          }
        } else {
          _this.onSuccess();
        }
      });
    }

    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.addKey = function addKey(url, key) {
    return url.indexOf('?') > -1 ? url.replace(/[?&]__k=(\w+)/, '') + "&__k=" + key : url + "?__k=" + key;
  };

  _proto.init = function init(location, key) {
    return true;
  };

  _proto._push = function _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.push = function push(location, key) {
    this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
    return true;
  };

  _proto._replace = function _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'replace' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.replace = function replace(location, key) {
    this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
    return true;
  };

  _proto.relaunch = function relaunch(location, key) {
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
  };

  _proto.back = function back(location, key, index) {
    this.history.navigateBack({
      delta: index[0]
    });
    return true;
  };

  _proto.exit = function exit() {
    this.history.navigateBack({
      delta: 99
    });
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return MPNativeRouter;
}(BaseNativeRouter);
function createRouter(history) {
  var mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}

setCoreConfig({
  SetPageTitle: function SetPageTitle(title) {
    return Taro.setNavigationBarTitle({
      title: title
    });
  }
});
var TaroRouter;
var beforeOnShow;
var tabPages = undefined;
var curLocation;
var eventBus = new SingleDispatcher();

function routeToPathname(route) {
  return "/" + route.replace(/^\/+|\/+$/g, '');
}

function queryTosearch(query) {
  if (query === void 0) {
    query = {};
  }

  var parts = [];
  Object.keys(query).forEach(function (key) {
    parts.push(key + "=" + query[key]);
  });
  return parts.join('&');
}

var taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  isTabPage: function isTabPage(pathname) {
    if (!tabPages) {
      var tabConfig = env.__taroAppConfig.tabBar;

      if (tabConfig) {
        tabPages = (tabConfig.list || tabConfig.items).reduce(function (obj, item) {
          obj[routeToPathname(item.pagePath)] = true;
          return obj;
        }, {});
      } else {
        tabPages = {};
      }
    }

    return !!tabPages[pathname];
  },
  getLocation: function getLocation() {
    if (!curLocation) {
      if (process.env.TARO_ENV === 'h5') {
        TaroRouter.history.listen(function (_ref) {
          var _ref$location = _ref.location,
              pathname = _ref$location.pathname,
              search = _ref$location.search,
              action = _ref.action;

          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }

          curLocation = {
            pathname: pathname,
            search: search.replace(/^\?/, ''),
            action: action
          };
        });
        var _TaroRouter$history$l = TaroRouter.history.location,
            pathname = _TaroRouter$history$l.pathname,
            search = _TaroRouter$history$l.search;
        curLocation = {
          pathname: pathname,
          search: search.replace(/^\?/, ''),
          action: 'RELAUNCH'
        };
      } else {
        var arr = Taro.getCurrentPages();

        var _path;

        var query;

        if (arr.length === 0) {
          var _Taro$getLaunchOption = Taro.getLaunchOptionsSync();

          _path = _Taro$getLaunchOption.path;
          query = _Taro$getLaunchOption.query;
        } else {
          var current = arr[arr.length - 1];
          _path = current.route;
          query = current.options;
        }

        if (!_path) {
          return {
            pathname: '',
            search: '',
            action: 'RELAUNCH'
          };
        }

        curLocation = {
          pathname: routeToPathname(_path),
          search: queryTosearch(query),
          action: 'RELAUNCH'
        };
      }
    }

    return curLocation;
  },
  onRouteChange: function onRouteChange(callback) {
    return eventBus.addListener(callback);
  }
};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');

  beforeOnShow = function beforeOnShow() {
    return undefined;
  };
} else {
  TaroRouter = {};
  var prevPageInfo;

  beforeOnShow = function beforeOnShow() {
    var arr = Taro.getCurrentPages();
    var currentPage = arr[arr.length - 1];
    var currentPageInfo = {
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
      var action = 'PUSH';

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
buildConfigSetter(vueComponentsConfig);
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

defineComponent({
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

setCoreConfig({
  Platform: 'taro'
});
var EluxPage = defineComponent({
  setup: function setup() {
    var router = coreConfig.UseRouter();
    var store = ref();
    var unlink;
    useDidShow(function () {
      if (!unlink) {
        unlink = router.addListener(function (_ref) {
          var newStore = _ref.newStore;
          store.value = newStore;
        });
      }

      onShow();
    });
    useDidHide(function () {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    onBeforeUnmount(function () {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    return function () {
      return store.value ? createVNode(EWindow, {
        "store": store.value,
        "key": store.value.sid
      }, null) : createVNode("div", {
        "className": "g-page-loading"
      }, [createTextVNode("Loading...")]);
    };
  }
});
var cientSingleton;
function createApp(appConfig, appOptions) {
  if (appOptions === void 0) {
    appOptions = {};
  }

  if (!cientSingleton) {
    var onLaunch = appOptions.onLaunch;

    appOptions.onLaunch = function (options) {
      var location = taroHistory.getLocation();
      router.init({
        url: locationToUrl(location)
      }, {});
      onLaunch && onLaunch(options);
    };

    cientSingleton = createApp$1(appOptions);
    var router = createRouter(taroHistory);
    buildProvider(cientSingleton, router);
  }

  return cientSingleton;
}

export { DocumentHead, Else, EluxPage, Link, Switch, connectStore, createApp, patchActions, setConfig };
