'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var reactDom = require('react-dom');
var reactWebRedux = require('@elux/react-web-redux');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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

var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var env = root;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

exports.LoadingState = void 0;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(exports.LoadingState || (exports.LoadingState = {}));

var SingleDispatcher = function () {
  function SingleDispatcher() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
  }

  var _proto = SingleDispatcher.prototype;

  _proto.addListener = function addListener(callback) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(function (id) {
      listenerMap[id](data);
    });
  };

  return SingleDispatcher;
}();
var TaskCounter = function (_SingleDispatcher) {
  _inheritsLoose(TaskCounter, _SingleDispatcher);

  function TaskCounter(deferSecond) {
    var _this;

    _this = _SingleDispatcher.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "list", []);

    _defineProperty(_assertThisInitialized(_this), "ctimer", 0);

    _this.deferSecond = deferSecond;
    return _this;
  }

  var _proto3 = TaskCounter.prototype;

  _proto3.addItem = function addItem(promise, note) {
    var _this2 = this;

    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(function (item) {
      return item.promise === promise;
    })) {
      this.list.push({
        promise: promise,
        note: note
      });
      promise.finally(function () {
        return _this2.completeItem(promise);
      });

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(exports.LoadingState.Start);
        this.ctimer = env.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch(exports.LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto3.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }

        this.dispatch(exports.LoadingState.Stop);
      }
    }

    return this;
  };

  return TaskCounter;
}(SingleDispatcher);
function isPlainObject$1(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    var src = target[key];
    var val = inject[key];

    if (isPlainObject$1(val)) {
      if (isPlainObject$1(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

function deepMerge(target) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!isPlainObject$1(target)) {
    target = {};
  }

  args = args.filter(function (item) {
    return isPlainObject$1(item) && Object.keys(item).length;
  });

  if (args.length < 1) {
    return target;
  }

  args.forEach(function (inject, index) {
    if (isPlainObject$1(inject)) {
      var lastArg = false;
      var last2Arg = null;

      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }

      Object.keys(inject).forEach(function (key) {
        var src = target[key];
        var val = inject[key];

        if (isPlainObject$1(val)) {
          if (isPlainObject$1(src)) {
            target[key] = __deepMerge(lastArg, src, val);
          } else {
            target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}
function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function isServer() {
  return env.isServer;
}
function serverSide(callback) {
  if (env.isServer) {
    return callback();
  }

  return undefined;
}
function clientSide(callback) {
  if (!env.isServer) {
    return callback();
  }

  return undefined;
}
function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        env.setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}

var config = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2
};
function setConfig$1(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}
var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: "Elux" + config.NSP + "Error"
};
function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MInit,
    payload: [initState]
  };
}
function moduleReInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MReInit,
    payload: [initState]
  };
}
function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MLoading,
    payload: [loadingState]
  };
}
function isEluxComponent(data) {
  return data['__elux_component__'];
}
var MetaData$1 = {
  appModuleName: 'stage',
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null,
  clientStore: null,
  moduleGetter: null
};

function transformAction(actionName, handler, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    warn("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, handlers) {
  var injectedModules = MetaData$1.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData$1.effectsMap : MetaData$1.reducersMap);
            } else {
              transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData$1.effectsMap : MetaData$1.reducersMap);
            }
          });
        }
      })();
    }
  }
}
var loadings = {};
function setLoading(store, item, moduleName, groupName) {
  var key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(config.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = moduleLoadingAction(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingKey) {
  if (loadingKey === void 0) {
    loadingKey = 'app.loading.global';
  }

  var loadingForModuleName;
  var loadingForGroupName;

  if (loadingKey !== null) {
    var _loadingKey$split = loadingKey.split('.');

    loadingForModuleName = _loadingKey$split[0];
    loadingForGroupName = _loadingKey$split[2];
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName) {
      var before = function before(curAction, moduleName, promiseResult) {
        if (!env.isServer) {
          if (loadingForModuleName === 'app') {
            loadingForModuleName = MetaData$1.appModuleName;
          } else if (loadingForModuleName === 'this') {
            loadingForModuleName = moduleName;
          }

          setLoading(MetaData$1.clientStore, promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
function logger(before, after) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (config.MutableData) {
    return deepMerge.apply(void 0, [target].concat(args));
  }

  return deepMerge.apply(void 0, [{}, target].concat(args));
}
function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (config.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }

  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _decorate(decorators, factory, superClass, mixins) {
  var api = _getDecoratorsApi();

  if (mixins) {
    for (var i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }

  var r = factory(function initialize(O) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}

function _getDecoratorsApi() {
  _getDecoratorsApi = function _getDecoratorsApi() {
    return api;
  };

  var api = {
    elementsDefinitionOrder: [["method"], ["field"]],
    initializeInstanceElements: function initializeInstanceElements(O, elements) {
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          if (element.kind === kind && element.placement === "own") {
            this.defineClassElement(O, element);
          }
        }, this);
      }, this);
    },
    initializeClassElements: function initializeClassElements(F, elements) {
      var proto = F.prototype;
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          var placement = element.placement;

          if (element.kind === kind && (placement === "static" || placement === "prototype")) {
            var receiver = placement === "static" ? F : proto;
            this.defineClassElement(receiver, element);
          }
        }, this);
      }, this);
    },
    defineClassElement: function defineClassElement(receiver, element) {
      var descriptor = element.descriptor;

      if (element.kind === "field") {
        var initializer = element.initializer;
        descriptor = {
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          configurable: descriptor.configurable,
          value: initializer === void 0 ? void 0 : initializer.call(receiver)
        };
      }

      Object.defineProperty(receiver, element.key, descriptor);
    },
    decorateClass: function decorateClass(elements, decorators) {
      var newElements = [];
      var finishers = [];
      var placements = {
        "static": [],
        prototype: [],
        own: []
      };
      elements.forEach(function (element) {
        this.addElementPlacement(element, placements);
      }, this);
      elements.forEach(function (element) {
        if (!_hasDecorators(element)) return newElements.push(element);
        var elementFinishersExtras = this.decorateElement(element, placements);
        newElements.push(elementFinishersExtras.element);
        newElements.push.apply(newElements, elementFinishersExtras.extras);
        finishers.push.apply(finishers, elementFinishersExtras.finishers);
      }, this);

      if (!decorators) {
        return {
          elements: newElements,
          finishers: finishers
        };
      }

      var result = this.decorateConstructor(newElements, decorators);
      finishers.push.apply(finishers, result.finishers);
      result.finishers = finishers;
      return result;
    },
    addElementPlacement: function addElementPlacement(element, placements, silent) {
      var keys = placements[element.placement];

      if (!silent && keys.indexOf(element.key) !== -1) {
        throw new TypeError("Duplicated element (" + element.key + ")");
      }

      keys.push(element.key);
    },
    decorateElement: function decorateElement(element, placements) {
      var extras = [];
      var finishers = [];

      for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
        var keys = placements[element.placement];
        keys.splice(keys.indexOf(element.key), 1);
        var elementObject = this.fromElementDescriptor(element);
        var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
        element = elementFinisherExtras.element;
        this.addElementPlacement(element, placements);

        if (elementFinisherExtras.finisher) {
          finishers.push(elementFinisherExtras.finisher);
        }

        var newExtras = elementFinisherExtras.extras;

        if (newExtras) {
          for (var j = 0; j < newExtras.length; j++) {
            this.addElementPlacement(newExtras[j], placements);
          }

          extras.push.apply(extras, newExtras);
        }
      }

      return {
        element: element,
        finishers: finishers,
        extras: extras
      };
    },
    decorateConstructor: function decorateConstructor(elements, decorators) {
      var finishers = [];

      for (var i = decorators.length - 1; i >= 0; i--) {
        var obj = this.fromClassDescriptor(elements);
        var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

        if (elementsAndFinisher.finisher !== undefined) {
          finishers.push(elementsAndFinisher.finisher);
        }

        if (elementsAndFinisher.elements !== undefined) {
          elements = elementsAndFinisher.elements;

          for (var j = 0; j < elements.length - 1; j++) {
            for (var k = j + 1; k < elements.length; k++) {
              if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                throw new TypeError("Duplicated element (" + elements[j].key + ")");
              }
            }
          }
        }
      }

      return {
        elements: elements,
        finishers: finishers
      };
    },
    fromElementDescriptor: function fromElementDescriptor(element) {
      var obj = {
        kind: element.kind,
        key: element.key,
        placement: element.placement,
        descriptor: element.descriptor
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      if (element.kind === "field") obj.initializer = element.initializer;
      return obj;
    },
    toElementDescriptors: function toElementDescriptors(elementObjects) {
      if (elementObjects === undefined) return;
      return _toArray(elementObjects).map(function (elementObject) {
        var element = this.toElementDescriptor(elementObject);
        this.disallowProperty(elementObject, "finisher", "An element descriptor");
        this.disallowProperty(elementObject, "extras", "An element descriptor");
        return element;
      }, this);
    },
    toElementDescriptor: function toElementDescriptor(elementObject) {
      var kind = String(elementObject.kind);

      if (kind !== "method" && kind !== "field") {
        throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
      }

      var key = _toPropertyKey(elementObject.key);
      var placement = String(elementObject.placement);

      if (placement !== "static" && placement !== "prototype" && placement !== "own") {
        throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
      }

      var descriptor = elementObject.descriptor;
      this.disallowProperty(elementObject, "elements", "An element descriptor");
      var element = {
        kind: kind,
        key: key,
        placement: placement,
        descriptor: Object.assign({}, descriptor)
      };

      if (kind !== "field") {
        this.disallowProperty(elementObject, "initializer", "A method descriptor");
      } else {
        this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
        element.initializer = elementObject.initializer;
      }

      return element;
    },
    toElementFinisherExtras: function toElementFinisherExtras(elementObject) {
      var element = this.toElementDescriptor(elementObject);

      var finisher = _optionalCallableProperty(elementObject, "finisher");

      var extras = this.toElementDescriptors(elementObject.extras);
      return {
        element: element,
        finisher: finisher,
        extras: extras
      };
    },
    fromClassDescriptor: function fromClassDescriptor(elements) {
      var obj = {
        kind: "class",
        elements: elements.map(this.fromElementDescriptor, this)
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      return obj;
    },
    toClassDescriptor: function toClassDescriptor(obj) {
      var kind = String(obj.kind);

      if (kind !== "class") {
        throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
      }

      this.disallowProperty(obj, "key", "A class descriptor");
      this.disallowProperty(obj, "placement", "A class descriptor");
      this.disallowProperty(obj, "descriptor", "A class descriptor");
      this.disallowProperty(obj, "initializer", "A class descriptor");
      this.disallowProperty(obj, "extras", "A class descriptor");

      var finisher = _optionalCallableProperty(obj, "finisher");

      var elements = this.toElementDescriptors(obj.elements);
      return {
        elements: elements,
        finisher: finisher
      };
    },
    runClassFinishers: function runClassFinishers(constructor, finishers) {
      for (var i = 0; i < finishers.length; i++) {
        var newConstructor = (0, finishers[i])(constructor);

        if (newConstructor !== undefined) {
          if (typeof newConstructor !== "function") {
            throw new TypeError("Finishers must return a constructor.");
          }

          constructor = newConstructor;
        }
      }

      return constructor;
    },
    disallowProperty: function disallowProperty(obj, name, objectType) {
      if (obj[name] !== undefined) {
        throw new TypeError(objectType + " can't have a ." + name + " property.");
      }
    }
  };
  return api;
}

function _createElementDescriptor(def) {
  var key = _toPropertyKey(def.key);
  var descriptor;

  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }

  var element = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}

function _coalesceGetterSetter(element, other) {
  if (element.descriptor.get !== undefined) {
    other.descriptor.get = element.descriptor.get;
  } else {
    other.descriptor.set = element.descriptor.set;
  }
}

function _coalesceClassElements(elements) {
  var newElements = [];

  var isSameElement = function isSameElement(other) {
    return other.kind === "method" && other.key === element.key && other.placement === element.placement;
  };

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var other;

    if (element.kind === "method" && (other = newElements.find(isSameElement))) {
      if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
        if (_hasDecorators(element) || _hasDecorators(other)) {
          throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
        }

        other.descriptor = element.descriptor;
      } else {
        if (_hasDecorators(element)) {
          if (_hasDecorators(other)) {
            throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
          }

          other.decorators = element.decorators;
        }

        _coalesceGetterSetter(element, other);
      }
    } else {
      newElements.push(element);
    }
  }

  return newElements;
}

function _hasDecorators(element) {
  return element.decorators && element.decorators.length;
}

function _isDataDescriptor(desc) {
  return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}

function _optionalCallableProperty(obj, name) {
  var value = obj[name];

  if (value !== undefined && typeof value !== "function") {
    throw new TypeError("Expected '" + name + "' to be a function");
  }

  return value;
}

function getModuleGetter() {
  return MetaData$1.moduleGetter;
}
function exportModule(moduleName, ModuleHandles, params, components) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });

  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var moduleHandles = new ModuleHandles(moduleName);
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.store = store;
      injectActions(moduleName, moduleHandles);
      var _initState = moduleHandles.initState;
      var preModuleState = store.getState(moduleName);

      if (preModuleState) {
        return store.dispatch(moduleReInitAction(moduleName, _initState));
      }

      return store.dispatch(moduleInitAction(moduleName, _initState));
    }

    return undefined;
  };

  return {
    moduleName: moduleName,
    model: model,
    components: components,
    state: undefined,
    params: params,
    actions: undefined
  };
}
function getModule(moduleName) {
  if (MetaData$1.moduleCaches[moduleName]) {
    return MetaData$1.moduleCaches[moduleName];
  }

  var moduleOrPromise = MetaData$1.moduleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      MetaData$1.moduleCaches[moduleName] = module;
      return module;
    }, function (reason) {
      MetaData$1.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    MetaData$1.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  MetaData$1.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
function getModuleList(moduleNames) {
  if (moduleNames.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(moduleNames.map(function (moduleName) {
    if (MetaData$1.moduleCaches[moduleName]) {
      return MetaData$1.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  }));
}

function _loadModel(moduleName, store) {
  if (store === void 0) {
    store = MetaData$1.clientStore;
  }

  var moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.model(store);
    });
  }

  return moduleOrPromise.model(store);
}
function getComponet(moduleName, componentName) {
  var key = [moduleName, componentName].join(config.NSP);

  if (MetaData$1.componentCaches[key]) {
    return MetaData$1.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      var component = componentOrFun;
      MetaData$1.componentCaches[key] = component;
      return component;
    }

    var promiseComponent = componentOrFun().then(function (_ref2) {
      var component = _ref2.default;
      MetaData$1.componentCaches[key] = component;
      return component;
    }, function (reason) {
      MetaData$1.componentCaches[key] = undefined;
      throw reason;
    });
    MetaData$1.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  var moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}
function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(function (key) {
    if (MetaData$1.componentCaches[key]) {
      return MetaData$1.componentCaches[key];
    }

    var _key$split = key.split(config.NSP),
        moduleName = _key$split[0],
        componentName = _key$split[1];

    return getComponet(moduleName, componentName);
  }));
}
function loadComponet(moduleName, componentName, store, deps) {
  var promiseOrComponent = getComponet(moduleName, componentName);

  var callback = function callback(component) {
    if (component.__elux_component__ === 'view' && !store.getState(moduleName)) {
      if (env.isServer) {
        return null;
      }

      var module = getModule(moduleName);
      module.model(store);
    }

    deps[moduleName + config.NSP + componentName] = true;
    return component;
  };

  if (isPromise(promiseOrComponent)) {
    if (env.isServer) {
      return null;
    }

    return promiseOrComponent.then(callback);
  }

  return callback(promiseOrComponent);
}
var EmptyModuleHandlers = function EmptyModuleHandlers(moduleName) {
  _defineProperty(this, "store", void 0);

  _defineProperty(this, "initState", void 0);

  this.moduleName = moduleName;
  this.initState = {};
};
var CoreModuleHandlers = _decorate(null, function (_initialize) {
  var CoreModuleHandlers = function CoreModuleHandlers(moduleName, initState) {
    _initialize(this);

    this.moduleName = moduleName;
    this.initState = initState;
  };

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "store",
      value: void 0
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return MetaData$1.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return MetaData$1.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store.getCurrentState(this.moduleName);
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload, key) {
        return mergeState(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        var loading = mergeState(this.state.loading, payload);
        return mergeState(this.state, {
          loading: loading
        });
      }
    }]
  };
});
function getRootModuleAPI(data) {
  if (!MetaData$1.facadeMap) {
    if (data) {
      MetaData$1.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + config.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        var moduleFacade = {
          name: moduleName,
          actions: actions,
          actionNames: actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      var cacheData = {};
      MetaData$1.facadeMap = new Proxy({}, {
        set: function set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },
        get: function get(target, moduleName, receiver) {
          var val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get: function get(__, actionName) {
                  return moduleName + config.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + config.NSP + actionName,
                      payload: payload
                    };
                  };
                }
              })
            };
          }

          return cacheData[moduleName];
        }
      });
    }
  }

  return MetaData$1.facadeMap;
}
function exportComponent(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
function exportView(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}

var errorProcessed = '__eluxProcessed__';
function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
function setProcessedError(error, processed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return error;
}
function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

function enhanceStore(baseStore, middlewares) {
  var store = baseStore;
  var _getState = baseStore.getState;

  var getState = function getState(moduleName) {
    var state = _getState();

    return moduleName ? state[moduleName] : state;
  };

  store.getState = getState;
  var injectedModules = {};
  store.injectedModules = injectedModules;
  var currentData = {
    actionName: '',
    prevState: {}
  };
  var update = baseStore.update;

  store.getCurrentActionName = function () {
    return currentData.actionName;
  };

  store.getCurrentState = function (moduleName) {
    var state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };

  var _dispatch2 = function dispatch(action) {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  var middlewareAPI = {
    getState: getState,
    dispatch: function dispatch(action) {
      return _dispatch2(action);
    }
  };

  var preMiddleware = function preMiddleware() {
    return function (next) {
      return function (action) {
        if (action.type === ActionTypes.Error) {
          var actionData = getActionData(action);

          if (isProcessedError(actionData[0])) {
            return undefined;
          }

          actionData[0] = setProcessedError(actionData[0], true);
        }

        var _action$type$split = action.type.split(config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (env.isServer && actionName === ActionTypes.MLoading) {
          return undefined;
        }

        if (moduleName && actionName && MetaData$1.moduleGetter[moduleName]) {
          if (!injectedModules[moduleName]) {
            var result = _loadModel(moduleName, store);

            if (isPromise(result)) {
              return result.then(function () {
                return next(action);
              });
            }
          }
        }

        return next(action);
      };
    };
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    var effectResult = handler.apply(modelInstance, actionData);
    var decorators = handler.__decorators__;

    if (decorators) {
      var results = [];
      decorators.forEach(function (decorator, index) {
        results[index] = decorator[0](action, moduleName, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(function (reslove) {
      if (decorators) {
        var _results = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1]('Resolved', _results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, function (error) {
      if (decorators) {
        var _results2 = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1]('Rejected', _results2[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return _dispatch2(errorAction(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer, prevData) {
    var handlersMap = isReducer ? MetaData$1.reducersMap : MetaData$1.effectsMap;
    var actionName = action.type;

    var _actionName$split = actionName.split(config.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + config.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];

    var handlers = _extends({}, commonHandlers, universalHandlers);

    var handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === MetaData$1.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift.apply(orderList, action.priority);
      }

      var implemented = {};
      var actionData = getActionData(action);

      if (isReducer) {
        Object.assign(currentData, prevData);
        var newState = {};
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            var result = handler.apply(modelInstance, actionData);

            if (result) {
              newState[moduleName] = result;
            }
          }
        });
        update(actionName, newState, actionData);
      } else {
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            Object.assign(currentData, prevData);
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    var prevData = {
      actionName: action.type,
      prevState: getState()
    };
    respondHandler(action, true, prevData);
    return respondHandler(action, false, prevData);
  }

  var arr = middlewares ? [preMiddleware].concat(middlewares) : [preMiddleware];
  var chain = arr.map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch2 = compose.apply(void 0, chain)(_dispatch);
  store.dispatch = _dispatch2;
  return store;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime_1 = createCommonjsModule(function (module) {
var runtime = function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }

  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined$1,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined$1;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
module.exports );

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var defFun = function defFun() {
  return undefined;
};

function defineModuleGetter(moduleGetter, appModuleName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  MetaData$1.appModuleName = appModuleName;
  MetaData$1.moduleGetter = moduleGetter;

  if (!moduleGetter[appModuleName]) {
    throw appModuleName + " could not be found in moduleGetter";
  }
}
function renderApp(_x, _x2, _x3, _x4, _x5) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = _asyncToGenerator(regenerator.mark(function _callee(baseStore, preloadModules, preloadComponents, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, modules, appModule, AppView;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = MetaData$1.moduleGetter, appModuleName = MetaData$1.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = enhanceStore(baseStore, middlewares);
            MetaData$1.clientStore = store;
            _context.next = 8;
            return getModuleList(preloadModules);

          case 8:
            modules = _context.sent;
            _context.next = 11;
            return getComponentList(preloadComponents);

          case 11:
            appModule = modules[0];
            _context.next = 14;
            return appModule.model(store);

          case 14:
            AppView = getComponet(appModuleName, appViewName);
            return _context.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

function ssrApp(_x6, _x7, _x8, _x9) {
  return _ssrApp.apply(this, arguments);
}

function _ssrApp() {
  _ssrApp = _asyncToGenerator(regenerator.mark(function _callee2(baseStore, preloadModules, middlewares, appViewName) {
    var moduleGetter, appModuleName, store, _yield$getModuleList, appModule, otherModules, AppView;

    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (appViewName === void 0) {
              appViewName = 'main';
            }

            moduleGetter = MetaData$1.moduleGetter, appModuleName = MetaData$1.appModuleName;
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = enhanceStore(baseStore, middlewares);
            _context2.next = 7;
            return getModuleList(preloadModules);

          case 7:
            _yield$getModuleList = _context2.sent;
            appModule = _yield$getModuleList[0];
            otherModules = _yield$getModuleList.slice(1);
            _context2.next = 12;
            return appModule.model(store);

          case 12:
            _context2.next = 14;
            return Promise.all(otherModules.map(function (module) {
              return module.model(store);
            }));

          case 14:
            store.dispatch = defFun;
            AppView = getComponet(appModuleName, appViewName);
            return _context2.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ssrApp.apply(this, arguments);
}

env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: {}
};
function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
  conf.defaultParams && (routeConfig.defaultParams = conf.defaultParams);
}

function locationToUri(location, key) {
  var pagename = location.pagename,
      params = location.params;
  var query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join('|'),
    pagename: pagename,
    query: query,
    key: key
  };
}

function isHistoryRecord(data) {
  return data['uri'];
}

function splitUri() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _args$ = args[0],
      uri = _args$ === void 0 ? '' : _args$,
      name = args[1];

  var _uri$split = uri.split('|'),
      key = _uri$split[0],
      pagename = _uri$split[1],
      others = _uri$split.slice(2);

  var arr = [key, pagename, others.join('|')];
  var index = {
    key: 0,
    pagename: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

function uriToLocation(uri) {
  var _splitUri = splitUri(uri),
      key = _splitUri[0],
      pagename = _splitUri[1],
      query = _splitUri[2];

  var location = {
    pagename: pagename,
    params: JSON.parse(query)
  };
  return {
    key: key,
    location: location
  };
}
var History = function () {
  function History(data, parent) {
    _defineProperty(this, "curRecord", void 0);

    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);

    this.parent = parent;

    if (isHistoryRecord(data)) {
      this.curRecord = data;
    } else {
      var _locationToUri = locationToUri(data.location, data.key),
          _uri = _locationToUri.uri,
          pagename = _locationToUri.pagename,
          query = _locationToUri.query;

      this.curRecord = {
        uri: _uri,
        pagename: pagename,
        query: query,
        key: data.key,
        sub: new History({
          uri: _uri,
          pagename: pagename,
          query: query,
          key: data.key
        }, this)
      };
    }
  }

  var _proto = History.prototype;

  _proto.getLength = function getLength() {
    return this.actions.length;
  };

  _proto.getRecord = function getRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.actions.length - 1;
      }

      return this.actions[keyOrIndex];
    }

    return this.actions.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.findIndex = function findIndex(key) {
    return this.actions.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getCurrentInternalHistory = function getCurrentInternalHistory() {
    return this.curRecord.sub;
  };

  _proto.getStack = function getStack() {
    return this.actions;
  };

  _proto.getUriStack = function getUriStack() {
    return this.actions.map(function (item) {
      return item.uri;
    });
  };

  _proto.getPageStack = function getPageStack() {
    return this.pages;
  };

  _proto.push = function push(location, key) {
    var _pages$;

    var historyRecord = this.curRecord;

    var _locationToUri2 = locationToUri(location, key),
        uri = _locationToUri2.uri,
        pagename = _locationToUri2.pagename,
        query = _locationToUri2.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var actionsMax = routeConfig.actionMaxHistory;
    var pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(historyRecord);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) == null ? void 0 : _pages$.uri, 'pagename') !== pagename) {
      pages.unshift(historyRecord);

      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = historyRecord;
    }

    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.replace = function replace(location, key) {
    var _locationToUri3 = locationToUri(location, key),
        uri = _locationToUri3.uri,
        pagename = _locationToUri3.pagename,
        query = _locationToUri3.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.relaunch = function relaunch(location, key) {
    var _locationToUri4 = locationToUri(location, key),
        uri = _locationToUri4.uri,
        pagename = _locationToUri4.pagename,
        query = _locationToUri4.query;

    this.curRecord = {
      uri: uri,
      pagename: pagename,
      query: query,
      key: key,
      sub: new History({
        uri: uri,
        pagename: pagename,
        query: query,
        key: key
      }, this)
    };
    this.actions = [];
    this.pages = [];

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }
  };

  _proto.back = function back(delta) {
    var _actions$;

    var historyRecord = this.getRecord(delta - 1);

    if (!historyRecord) {
      return false;
    }

    this.curRecord = historyRecord;
    var uri = historyRecord.uri,
        pagename = historyRecord.pagename,
        query = historyRecord.query;
    var pages = [].concat(this.pages);
    var actions = [].concat(this.actions);
    var deleteActions = actions.splice(0, delta);
    var arr = deleteActions.reduce(function (pre, curStack) {
      var ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[0]) == null ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length);
    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = _extends({}, this.parent.curRecord, {
        uri: uri,
        pagename: pagename,
        query: query
      });
    }

    return true;
  };

  return History;
}();

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target, def) {
  var clone = {};
  Object.keys(def).forEach(function (key) {
    if (target[key] === undefined) {
      clone[key] = def[key];
    } else {
      var tval = target[key];
      var dval = def[key];

      if (isPlainObject(tval) && isPlainObject(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}

function extendDefault(target, def) {
  if (!isPlainObject(target)) {
    target = {};
  }

  if (!isPlainObject(def)) {
    def = {};
  }

  return __extendDefault(target, def);
}

function __excludeDefault(data, def) {
  var result = {};
  var hasSub = false;
  Object.keys(data).forEach(function (key) {
    var value = data[key];
    var defaultValue = def[key];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && isPlainObject(value)) {
        value = __excludeDefault(value, defaultValue);
      }

      if (value !== undefined) {
        hasSub = true;
        result[key] = value;
      }
    }
  });

  if (hasSub) {
    return result;
  }

  return undefined;
}

function excludeDefault(data, def, keepTopLevel) {
  if (!isPlainObject(data)) {
    return {};
  }

  if (!isPlainObject(def)) {
    return data;
  }

  var filtered = __excludeDefault(data, def);

  if (keepTopLevel) {
    var result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }

  return filtered || {};
}

function __splitPrivate(data) {
  var keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  var publicData;
  var privateData;
  keys.forEach(function (key) {
    var value = data[key];

    if (key.startsWith('_')) {
      if (!privateData) {
        privateData = {};
      }

      privateData[key] = value;
    } else if (isPlainObject(value)) {
      var _splitPrivate = __splitPrivate(value),
          subPublicData = _splitPrivate[0],
          subPrivateData = _splitPrivate[1];

      if (subPublicData) {
        if (!publicData) {
          publicData = {};
        }

        publicData[key] = subPublicData;
      }

      if (subPrivateData) {
        if (!privateData) {
          privateData = {};
        }

        privateData[key] = subPrivateData;
      }
    } else {
      if (!publicData) {
        publicData = {};
      }

      publicData[key] = value;
    }
  });
  return [publicData, privateData];
}

function splitPrivate(data, deleteTopLevel) {
  if (!isPlainObject(data)) {
    return [undefined, undefined];
  }

  var keys = Object.keys(data);

  if (keys.length === 0) {
    return [undefined, undefined];
  }

  var result = __splitPrivate(data);

  var publicData = result[0];
  var privateData = result[1];
  keys.forEach(function (key) {
    if (!deleteTopLevel[key]) {
      if (!publicData) {
        publicData = {};
      }

      if (!publicData[key]) {
        publicData[key] = {};
      }
    }
  });
  return [publicData, privateData];
}

function assignDefaultData(data) {
  var def = routeConfig.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitQuery(query) {
  return (query || '').split('&').reduce(function (params, str) {
    var sections = str.split('=');

    if (sections.length > 1) {
      var key = sections[0],
          arr = sections.slice(1);

      if (!params) {
        params = {};
      }

      params[key] = decodeURIComponent(arr.join('='));
    }

    return params;
  }, undefined);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

function isEluxLocation(data) {
  return data['params'];
}

function nativeUrlToNativeLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined
    };
  }

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var path = arr[0],
      search = arr[1],
      hash = arr[2];
  return {
    pathname: "/" + path.replace(/^\/+|\/+$/g, ''),
    searchData: splitQuery(search),
    hashData: splitQuery(hash)
  };
}
function eluxUrlToEluxLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      params: {}
    };
  }

  var _url$split = url.split('?'),
      pathname = _url$split[0],
      others = _url$split.slice(1);

  var query = others.join('?');
  var params = {};

  if (query && query.charAt(0) === '{' && query.charAt(query.length - 1) === '}') {
    try {
      params = JSON.parse(query);
    } catch (e) {
      env.console.error(e);
    }
  }

  return {
    pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
    params: params
  };
}
function nativeLocationToNativeUrl(_ref) {
  var pathname = _ref.pathname,
      searchData = _ref.searchData,
      hashData = _ref.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}
function eluxLocationToEluxUrl(location) {
  return [location.pathname, JSON.stringify(location.params || {})].join('?');
}
function createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  var pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce(function (obj, key) {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    urlToLocation: function urlToLocation(url) {
      return this.partialLocationToLocation(this.urlToToPartialLocation(url));
    },
    urlToToPartialLocation: function urlToToPartialLocation(url) {
      var givenLocation = this.urlToGivenLocation(url);

      if (isEluxLocation(givenLocation)) {
        return this.eluxLocationToPartialLocation(givenLocation);
      }

      return this.nativeLocationToPartialLocation(givenLocation);
    },
    urlToEluxLocation: function urlToEluxLocation(url) {
      var givenLocation = this.urlToGivenLocation(url);

      if (isEluxLocation(givenLocation)) {
        return givenLocation;
      }

      return this.nativeLocationToEluxLocation(givenLocation);
    },
    urlToGivenLocation: function urlToGivenLocation(url) {
      var _url$split2 = url.split('?', 2),
          query = _url$split2[1];

      if (query && query.charAt(0) === '{') {
        return eluxUrlToEluxLocation(url);
      }

      return nativeUrlToNativeLocation(url);
    },
    nativeLocationToLocation: function nativeLocationToLocation(nativeLocation) {
      return this.partialLocationToLocation(this.nativeLocationToPartialLocation(nativeLocation));
    },
    nativeLocationToPartialLocation: function nativeLocationToPartialLocation(nativeLocation) {
      var eluxLocation = this.nativeLocationToEluxLocation(nativeLocation);
      return this.eluxLocationToPartialLocation(eluxLocation);
    },
    nativeLocationToEluxLocation: function nativeLocationToEluxLocation(nativeLocation) {
      nativeLocation = nativeLocationMap.in(nativeLocation);
      var searchParams;
      var hashParams;

      try {
        searchParams = nativeLocation.searchData && nativeLocation.searchData[paramsKey] ? JSON.parse(nativeLocation.searchData[paramsKey]) : undefined;
        hashParams = nativeLocation.hashData && nativeLocation.hashData[paramsKey] ? JSON.parse(nativeLocation.hashData[paramsKey]) : undefined;
      } catch (e) {
        env.console.error(e);
      }

      return {
        pathname: nativeLocation.pathname,
        params: deepMerge(searchParams, hashParams)
      };
    },
    eluxLocationToNativeLocation: function eluxLocationToNativeLocation(eluxLocation) {
      var _ref2, _ref3;

      var pathname = ("/" + eluxLocation.pathname + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return pathname.startsWith(name);
      });
      var pathParams = {};

      if (pagename) {
        var _pathArgs = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
      } else {
        pagename = notfoundPagename + "/";

        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }

      var result = splitPrivate(eluxLocation.params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[0]), _ref2) : undefined,
        hashData: result[1] ? (_ref3 = {}, _ref3[paramsKey] = JSON.stringify(result[1]), _ref3) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    },
    eluxLocationToPartialLocation: function eluxLocationToPartialLocation(eluxLocation) {
      var pathname = ("/" + eluxLocation.pathname + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return pathname.startsWith(name);
      });
      var pathParams = {};

      if (pagename) {
        var _pathArgs2 = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs2);
      } else {
        pagename = notfoundPagename + "/";

        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }

      var params = deepMerge({}, pathParams, eluxLocation.params);
      var moduleGetter = getModuleGetter();
      Object.keys(params).forEach(function (moduleName) {
        if (!moduleGetter[moduleName]) {
          delete params[moduleName];
        }
      });
      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: params
      };
    },
    partialLocationToLocation: function partialLocationToLocation(partialLocation) {
      var pagename = partialLocation.pagename,
          params = partialLocation.params;
      var def = routeConfig.defaultParams;
      var asyncLoadModules = Object.keys(params).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      return getModuleList(asyncLoadModules).then(function (modules) {
        modules.forEach(function (module) {
          def[module.moduleName] = module.params;
        });
        return {
          pagename: pagename,
          params: assignDefaultData(params)
        };
      });
    },
    eluxLocationToLocation: function eluxLocationToLocation(eluxLocation) {
      return this.partialLocationToLocation(this.eluxLocationToPartialLocation(eluxLocation));
    },
    partialLocationToMinData: function partialLocationToMinData(partialLocation) {
      var params = excludeDefault(partialLocation.params, routeConfig.defaultParams, true);
      var pathParams;
      var pathname;
      var pagename = ("/" + partialLocation.pagename + "/").replace(/^\/+|\/+$/g, '/');

      if (pagenameMap[pagename]) {
        var _pathArgs3 = toStringArgs(pagenameMap[pagename].paramsToArgs(params));

        pathname = pagename + _pathArgs3.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/').replace(/\/*$/, '');
        pathParams = pagenameMap[pagename].argsToParams(_pathArgs3);
      } else {
        pathname = pagename;
        pathParams = {};
      }

      params = excludeDefault(params, pathParams, false);
      return {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        params: params,
        pathParams: pathParams
      };
    },
    partialLocationToEluxLocation: function partialLocationToEluxLocation(partialLocation) {
      var _this$partialLocation = this.partialLocationToMinData(partialLocation),
          pathname = _this$partialLocation.pathname,
          params = _this$partialLocation.params;

      return {
        pathname: pathname,
        params: params
      };
    },
    partialLocationToNativeLocation: function partialLocationToNativeLocation(partialLocation) {
      var _ref4, _ref5;

      var _this$partialLocation2 = this.partialLocationToMinData(partialLocation),
          pathname = _this$partialLocation2.pathname,
          params = _this$partialLocation2.params,
          pathParams = _this$partialLocation2.pathParams;

      var result = splitPrivate(params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref4 = {}, _ref4[paramsKey] = JSON.stringify(result[0]), _ref4) : undefined,
        hashData: result[1] ? (_ref5 = {}, _ref5[paramsKey] = JSON.stringify(result[1]), _ref5) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}

var ModuleWithRouteHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  var ModuleWithRouteHandlers = function (_CoreModuleHandlers2) {
    _inheritsLoose(ModuleWithRouteHandlers, _CoreModuleHandlers2);

    function ModuleWithRouteHandlers() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize(_assertThisInitialized(_this));

      return _this;
    }

    return ModuleWithRouteHandlers;
  }(_CoreModuleHandlers);

  return {
    F: ModuleWithRouteHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        var routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMerge({}, initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return deepMergeState(this.state, payload);
      }
    }]
  };
}, CoreModuleHandlers);
var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "route" + config.NSP + "RouteChange",
  TestRouteChange: "route" + config.NSP + "TestRouteChange"
};
function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}
function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action]
  };
}
function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === RouteActionTypes.RouteChange) {
        var result = next(action);
        var routeState = action.payload[0];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams && Object.keys(routeParams).length > 0) {
            if (rootState[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
            }
          }
        });
        return result;
      }

      return next(action);
    };
  };
};

var RouteModuleHandlers = _decorate(null, function (_initialize2) {
  var RouteModuleHandlers = function RouteModuleHandlers() {
    _initialize2(this);
  };

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "field",
      key: "initState",
      value: void 0
    }, {
      kind: "field",
      key: "moduleName",
      value: void 0
    }, {
      kind: "field",
      key: "store",
      value: void 0
    }, {
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteChange",
      value: function RouteChange(routeState) {
        return mergeState(this.state, routeState);
      }
    }]
  };
});

var defaultNativeLocationMap = {
  in: function _in(nativeLocation) {
    return nativeLocation;
  },
  out: function out(nativeLocation) {
    return nativeLocation;
  }
};
function createRouteModule(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (nativeLocationMap === void 0) {
    nativeLocationMap = defaultNativeLocationMap;
  }

  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  var handlers = RouteModuleHandlers;
  var locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  var routeModule = exportModule('route', handlers, {}, {});
  return _extends({}, routeModule, {
    locationTransform: locationTransform
  });
}

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "router", null);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  };

  _proto.setRouter = function setRouter(router) {
    this.router = router;
  };

  _proto.execute = function execute(method, getNativeData) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      var task = {
        resolve: resolve,
        reject: reject,
        nativeData: undefined
      };
      _this.curTask = task;

      var result = _this[method].apply(_this, [function () {
        var nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }].concat(args));

      if (!result) {
        resolve(undefined);
        _this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(function (e) {
          reject(e);
          _this.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();
var BaseRouter = function () {
  function BaseRouter(url, nativeRouter, locationTransform) {
    var _this2 = this;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "internalUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "_lid", 0);

    _defineProperty(this, "listenerMap", {});

    _defineProperty(this, "initedPromise", void 0);

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    this.initedPromise = locationTransform.urlToLocation(url).then(function (location) {
      var key = _this2._createKey();

      var routeState = _extends({}, location, {
        action: 'RELAUNCH',
        key: key
      });

      _this2.routeState = routeState;
      _this2.internalUrl = eluxLocationToEluxUrl({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!routeConfig.indexUrl) {
        setRouteConfig({
          indexUrl: _this2.internalUrl
        });
      }

      _this2.history = new History({
        location: location,
        key: key
      });
      return routeState;
    });
  }

  var _proto2 = BaseRouter.prototype;

  _proto2.addListener = function addListener(callback) {
    this._lid++;
    var id = "" + this._lid;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto2.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var arr = Object.keys(listenerMap).map(function (id) {
      return listenerMap[id](data);
    });
    return Promise.all(arr);
  };

  _proto2.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto2.getPagename = function getPagename() {
    return this.routeState.pagename;
  };

  _proto2.getParams = function getParams() {
    return this.routeState.params;
  };

  _proto2.getInternalUrl = function getInternalUrl() {
    return this.internalUrl;
  };

  _proto2.getNativeLocation = function getNativeLocation() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeLocation;
  };

  _proto2.getNativeUrl = function getNativeUrl() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeUrl;
  };

  _proto2.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto2.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto2.findHistoryIndexByKey = function findHistoryIndexByKey(key) {
    return this.history.findIndex(key);
  };

  _proto2.locationToNativeData = function locationToNativeData(location) {
    var nativeLocation = this.locationTransform.partialLocationToNativeLocation(location);
    var nativeUrl = nativeLocationToNativeUrl(nativeLocation);
    return {
      nativeUrl: nativeUrl,
      nativeLocation: nativeLocation
    };
  };

  _proto2.urlToLocation = function urlToLocation(url) {
    return this.locationTransform.urlToLocation(url);
  };

  _proto2.payloadLocationToEluxUrl = function payloadLocationToEluxUrl(data) {
    var eluxLocation = this.payloadToEluxLocation(data);
    return eluxLocationToEluxUrl(eluxLocation);
  };

  _proto2.payloadLocationToNativeUrl = function payloadLocationToNativeUrl(data) {
    var eluxLocation = this.payloadToEluxLocation(data);
    var nativeLocation = this.locationTransform.eluxLocationToNativeLocation(eluxLocation);
    return nativeLocationToNativeUrl(nativeLocation);
  };

  _proto2._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto2.payloadToEluxLocation = function payloadToEluxLocation(payload) {
    var params = payload.params || {};
    var extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pathname: payload.pathname || this.routeState.pagename,
      params: params
    };
  };

  _proto2.preAdditions = function preAdditions(data) {
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }

      return this.locationTransform.urlToLocation(data);
    }

    var eluxLocation = this.payloadToEluxLocation(data);
    return this.locationTransform.eluxLocationToLocation(eluxLocation);
  };

  _proto2.relaunch = function relaunch(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(regenerator.mark(function _callee(data, internal, disableNative) {
      var _this3 = this;

      var preData, location, key, routeState, nativeData;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context.sent;

              if (preData) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = _extends({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 10;
              return this.store.dispatch(testRouteChangeAction(routeState));

            case 10:
              _context.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context.next = 16;
                break;
              }

              _context.next = 15;
              return this.nativeRouter.execute('relaunch', function () {
                return _this3.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context.sent;

            case 16:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.internalUrl = eluxLocationToEluxUrl({
                pathname: routeState.pagename,
                params: routeState.params
              });
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(location, key);
              } else {
                this.history.relaunch(location, key);
              }

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _relaunch(_x, _x2, _x3) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.push = function push(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._push.bind(this, data, internal, disableNative));
  };

  _proto2._push = function () {
    var _push2 = _asyncToGenerator(regenerator.mark(function _callee2(data, internal, disableNative) {
      var _this4 = this;

      var preData, location, key, routeState, nativeData;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context2.sent;

              if (preData) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = _extends({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 10;
              return this.store.dispatch(testRouteChangeAction(routeState));

            case 10:
              _context2.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context2.next = 16;
                break;
              }

              _context2.next = 15;
              return this.nativeRouter.execute('push', function () {
                return _this4.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context2.sent;

            case 16:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.internalUrl = eluxLocationToEluxUrl({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              this.store.dispatch(routeChangeAction(routeState));

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _push(_x4, _x5, _x6) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.replace = function replace(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._replace.bind(this, data, internal, disableNative));
  };

  _proto2._replace = function () {
    var _replace2 = _asyncToGenerator(regenerator.mark(function _callee3(data, internal, disableNative) {
      var _this5 = this;

      var preData, location, key, routeState, nativeData;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context3.sent;

              if (preData) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = _extends({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 10;
              return this.store.dispatch(testRouteChangeAction(routeState));

            case 10:
              _context3.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context3.next = 16;
                break;
              }

              _context3.next = 15;
              return this.nativeRouter.execute('replace', function () {
                return _this5.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context3.sent;

            case 16:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.internalUrl = eluxLocationToEluxUrl({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              this.store.dispatch(routeChangeAction(routeState));

            case 21:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _replace(_x7, _x8, _x9) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.back = function back(n, indexUrl, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (indexUrl === void 0) {
      indexUrl = 'index';
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  };

  _proto2._back = function () {
    var _back2 = _asyncToGenerator(regenerator.mark(function _callee4(n, indexUrl, internal, disableNative) {
      var _this6 = this;

      var stack, uri, _uriToLocation, key, location, routeState, nativeData;

      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

              if (stack) {
                _context4.next = 6;
                break;
              }

              if (!indexUrl) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt("return", this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative));

            case 5:
              throw {
                code: '1',
                message: 'history not found'
              };

            case 6:
              uri = stack.uri;
              _uriToLocation = uriToLocation(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = _extends({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 11;
              return this.store.dispatch(testRouteChangeAction(routeState));

            case 11:
              _context4.next = 13;
              return this.dispatch(routeState);

            case 13:
              if (!(!disableNative && !internal)) {
                _context4.next = 17;
                break;
              }

              _context4.next = 16;
              return this.nativeRouter.execute('back', function () {
                return _this6.locationToNativeData(routeState);
              }, n, key);

            case 16:
              nativeData = _context4.sent;

            case 17:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.internalUrl = eluxLocationToEluxUrl({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              this.store.dispatch(routeChangeAction(routeState));
              return _context4.abrupt("return", undefined);

            case 23:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12, _x13) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.taskComplete = function taskComplete() {
    var task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  };

  _proto2.executeTask = function executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  };

  _proto2.addTask = function addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseRouter;
}();

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
} // About 1.5x faster than the two-arg version of Array#splice()


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
} // This implementation is based heavily on node's url.parse


function resolvePathname(to, from) {
  if (from === undefined) from = '';
  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];
  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';
  var hasTrailingSlash;

  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;

  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');
  if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
  var result = fromParts.join('/');
  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
  return result;
}

var isProduction$1 = process.env.NODE_ENV === 'production';

function warning(condition, message) {
  if (!isProduction$1) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

var isProduction = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';

function invariant(condition, message) {
  if (condition) {
    return;
  }

  if (isProduction) {
    throw new Error(prefix);
  }

  throw new Error(prefix + ": " + (message || ''));
}

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
}

function hasBasename(path, prefix) {
  return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}

function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';
  var hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}

function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;
  var path = pathname || '/';
  if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
  return path;
}

function createLocation(path, state, key, currentLocation) {
  var location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);
    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
    process.env.NODE_ENV !== "production" ? warning(prompt == null, 'A history supports only one prompt at a time') : void 0;
    prompt = nextPrompt;
    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  }

  function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          process.env.NODE_ENV !== "production" ? warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  var listeners = [];

  function appendListener(fn) {
    var isActive = true;

    function listener() {
      if (isActive) fn.apply(void 0, arguments);
    }

    listeners.push(listener);
    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notifyListeners() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  }

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function getConfirmation(message, callback) {
  callback(window.confirm(message)); // eslint-disable-line no-alert
}
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */


function supportsHistory() {
  var ua = window.navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
  return window.history && 'pushState' in window.history;
}
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */


function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */


function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
}
/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */


function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
}

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
}
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */


function createBrowserHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Browser history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canUseHistory = supportsHistory();
  var needsHashChangeListener = !supportsPopStateOnHashChange();
  var _props = props,
      _props$forceRefresh = _props.forceRefresh,
      forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

  function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
    var path = pathname + search + hash;
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path, state, key);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  var forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allKeys.indexOf(fromLocation.key);
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  }

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key]; // Public interface

  function createHref(location) {
    return basename + createPath(location);
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.pushState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.replaceState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
        window.location.replace(href);
      }
    });
  }

  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

var HashChangeEvent$1 = 'hashchange';
var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: stripLeadingSlash,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

function stripHash(url) {
  var hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
}

function pushHashPath(path) {
  window.location.hash = path;
}

function replaceHashPath(path) {
  window.location.replace(stripHash(window.location.href) + '#' + path);
}

function createHashHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Hash history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canGoWithoutReload = supportsGoWithoutReloadUsingHash();
  var _props = props,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$hashType = _props.hashType,
      hashType = _props$hashType === void 0 ? 'slash' : _props$hashType;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;

  function getDOMLocation() {
    var path = decodePath(getHashPath());
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  var forceNextPop = false;
  var ignorePath = null;

  function locationsAreEqual$$1(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }

  function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;
      if (!forceNextPop && locationsAreEqual$$1(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;
      handlePop(location);
    }
  }

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf(createPath(toLocation));
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  } // Ensure the hash is encoded properly before doing anything else.


  var path = getHashPath();
  var encodedPath = encodePath(path);
  if (path !== encodedPath) replaceHashPath(encodedPath);
  var initialLocation = getDOMLocation();
  var allPaths = [createPath(initialLocation)]; // Public interface

  function createHref(location) {
    var baseTag = document.querySelector('base');
    var href = '';

    if (baseTag && baseTag.getAttribute('href')) {
      href = stripHash(window.location.href);
    }

    return href + '#' + encodePath(basename + createPath(location));
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Hash history cannot push state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);
        var prevIndex = allPaths.lastIndexOf(createPath(history.location));
        var nextPaths = allPaths.slice(0, prevIndex + 1);
        nextPaths.push(path);
        allPaths = nextPaths;
        setState({
          action: action,
          location: location
        });
      } else {
        process.env.NODE_ENV !== "production" ? warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack') : void 0;
        setState();
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Hash history cannot replace state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf(createPath(history.location));
      if (prevIndex !== -1) allPaths[prevIndex] = path;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    process.env.NODE_ENV !== "production" ? warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(HashChangeEvent$1, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(HashChangeEvent$1, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

function clamp(n, lowerBound, upperBound) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}
/**
 * Creates a history object that stores locations in memory.
 */


function createMemoryHistory(props) {
  if (props === void 0) {
    props = {};
  }

  var _props = props,
      getUserConfirmation = _props.getUserConfirmation,
      _props$initialEntries = _props.initialEntries,
      initialEntries = _props$initialEntries === void 0 ? ['/'] : _props$initialEntries,
      _props$initialIndex = _props.initialIndex,
      initialIndex = _props$initialIndex === void 0 ? 0 : _props$initialIndex,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = history.entries.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var index = clamp(initialIndex, 0, initialEntries.length - 1);
  var entries = initialEntries.map(function (entry) {
    return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, entry.key || createKey());
  }); // Public interface

  var createHref = createPath;

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var prevIndex = history.index;
      var nextIndex = prevIndex + 1;
      var nextEntries = history.entries.slice(0);

      if (nextEntries.length > nextIndex) {
        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
      } else {
        nextEntries.push(location);
      }

      setState({
        action: action,
        location: location,
        index: nextIndex,
        entries: nextEntries
      });
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      history.entries[history.index] = location;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
    var action = 'POP';
    var location = history.entries[nextIndex];
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (ok) {
        setState({
          action: action,
          location: location,
          index: nextIndex
        });
      } else {
        // Mimic the behavior of DOM histories by
        // causing a render after a cancelled POP.
        setState();
      }
    });
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  function canGo(n) {
    var nextIndex = history.index + n;
    return nextIndex >= 0 && nextIndex < history.entries.length;
  }

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    return transitionManager.setPrompt(prompt);
  }

  function listen(listener) {
    return transitionManager.appendListener(listener);
  }

  var history = {
    length: entries.length,
    action: 'POP',
    location: entries[index],
    index: index,
    entries: entries,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    canGo: canGo,
    block: block,
    listen: listen
  };
  return history;
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(createHistory) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this), "history", void 0);

    _defineProperty(_assertThisInitialized(_this), "serverSide", false);

    if (createHistory === 'Hash') {
      _this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      _this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      _this.history = createBrowserHistory();
    } else {
      _this.serverSide = true;

      var _createHistory$split = createHistory.split('?'),
          pathname = _createHistory$split[0],
          _createHistory$split$ = _createHistory$split[1],
          search = _createHistory$split$ === void 0 ? '' : _createHistory$split$;

      _this.history = {
        action: 'PUSH',
        length: 0,
        listen: function listen() {
          return function () {
            return undefined;
          };
        },
        createHref: function createHref() {
          return '';
        },
        push: function push() {},
        replace: function replace() {},
        go: function go() {},
        goBack: function goBack() {},
        goForward: function goForward() {},
        block: function block() {
          return function () {
            return undefined;
          };
        },
        location: {
          pathname: pathname,
          search: search && "?" + search,
          hash: ''
        }
      };
    }

    _this._unlistenHistory = _this.history.block(function (location, action) {
      var _location$pathname = location.pathname,
          pathname = _location$pathname === void 0 ? '' : _location$pathname,
          _location$search = location.search,
          search = _location$search === void 0 ? '' : _location$search,
          _location$hash = location.hash,
          hash = _location$hash === void 0 ? '' : _location$hash;
      var url = [pathname, search, hash].join('');

      var key = _this.getKey(location);

      var changed = _this.onChange(key);

      if (changed) {
        var index = -1;
        var callback;

        if (action === 'POP') {
          index = _this.router.findHistoryIndexByKey(key);
        }

        if (index > -1) {
          callback = function callback() {
            return _this.router.back(index + 1, '', false, false);
          };
        } else if (action === 'REPLACE') {
          callback = function callback() {
            return _this.router.replace(url, false, false);
          };
        } else if (action === 'PUSH') {
          callback = function callback() {
            return _this.router.push(url, false, false);
          };
        } else {
          callback = function callback() {
            return _this.router.relaunch(url, false, false);
          };
        }

        callback && env.setTimeout(callback, 50);
        return false;
      }

      return undefined;
    });
    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.getUrl = function getUrl() {
    var _this$history$locatio = this.history.location,
        _this$history$locatio2 = _this$history$locatio.pathname,
        pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
        _this$history$locatio3 = _this$history$locatio.search,
        search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
        _this$history$locatio4 = _this$history$locatio.hash,
        hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
    return [pathname, search, hash].join('');
  };

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.passive = function passive(url, key, action) {
    return true;
  };

  _proto.refresh = function refresh() {
    this.history.go(0);
  };

  _proto.push = function push(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.replace = function replace(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.back = function back(getNativeData, n, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.go(-n);
      return nativeData;
    }

    return undefined;
  };

  _proto.toOutside = function toOutside(url) {
    this.history.push(url);
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(browserNativeRouter, locationTransform) {
    return _BaseRouter.call(this, browserNativeRouter.getUrl(), browserNativeRouter, locationTransform) || this;
  }

  return Router;
}(BaseRouter);
function createRouter(createHistory, locationTransform) {
  var browserNativeRouter = new BrowserNativeRouter(createHistory);
  var router = new Router(browserNativeRouter, locationTransform);
  return router;
}

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

var MetaData = {
  router: undefined
};
var EluxContext = React__default['default'].createContext({
  documentHead: ''
});

var loadComponentDefaultOptions = {
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return React__default['default'].createElement("div", {
      className: "g-component-error"
    }, message);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return React__default['default'].createElement("div", {
      className: "g-component-loading"
    }, "loading...");
  }
};
function setLoadComponentOptions(_ref2) {
  var LoadComponentOnError = _ref2.LoadComponentOnError,
      LoadComponentOnLoading = _ref2.LoadComponentOnLoading;
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}
var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  var OnError = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

  var Loader = function (_Component) {
    _inheritsLoose(Loader, _Component);

    function Loader(props, context) {
      var _this;

      _this = _Component.call(this, props) || this;

      _defineProperty(_assertThisInitialized(_this), "active", true);

      _defineProperty(_assertThisInitialized(_this), "loading", false);

      _defineProperty(_assertThisInitialized(_this), "error", '');

      _defineProperty(_assertThisInitialized(_this), "view", void 0);

      _defineProperty(_assertThisInitialized(_this), "state", {
        ver: 0
      });

      _this.context = context;

      _this.execute();

      return _this;
    }

    var _proto = Loader.prototype;

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.active = false;
    };

    _proto.shouldComponentUpdate = function shouldComponentUpdate() {
      this.execute();
      return true;
    };

    _proto.componentDidMount = function componentDidMount() {
      this.error = '';
    };

    _proto.execute = function execute() {
      var _this2 = this;

      if (!this.view && !this.loading && !this.error) {
        var _ref3 = this.context || {},
            deps = _ref3.deps,
            store = _ref3.store;

        this.loading = true;
        var result;

        try {
          result = loadComponet(moduleName, componentName, store, deps || {});
        } catch (e) {
          this.loading = false;
          this.error = e.message || "" + e;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(function (view) {
              if (view) {
                _this2.loading = false;
                _this2.view = view;
                _this2.active && _this2.setState({
                  ver: _this2.state.ver + 1
                });
              }
            }, function (e) {
              env.console.error(e);
              _this2.loading = false;
              _this2.error = e.message || "" + e || 'error';
              _this2.active && _this2.setState({
                ver: _this2.state.ver + 1
              });
            });
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    };

    _proto.render = function render() {
      var _this$props = this.props,
          forwardedRef = _this$props.forwardedRef,
          rest = _objectWithoutPropertiesLoose(_this$props, ["forwardedRef"]);

      if (this.view) {
        var View = this.view;
        return React__default['default'].createElement(View, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var Loading = OnLoading;
        return React__default['default'].createElement(Loading, null);
      }

      return React__default['default'].createElement(OnError, {
        message: this.error
      });
    };

    return Loader;
  }(React.Component);

  _defineProperty(Loader, "contextType", EluxContext);

  return React__default['default'].forwardRef(function (props, ref) {
    return React__default['default'].createElement(Loader, _extends({}, props, {
      forwardedRef: ref
    }));
  });
};

var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 0);
  }
}

var Component$2 = function Component(_ref) {
  var _ref$title = _ref.title,
      title = _ref$title === void 0 ? '' : _ref$title,
      _ref$html = _ref.html,
      html = _ref$html === void 0 ? '' : _ref$html;

  if (!html) {
    html = "<title>" + title + "</title>";
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
  }

  var eluxContext = React.useContext(EluxContext);

  if (isServer()) {
    eluxContext.documentHead = html;
  }

  React.useEffect(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    return function () {
      return setClientHead(eluxContext, raw);
    };
  }, [eluxContext, html]);
  return null;
};

var DocumentHead = React__default['default'].memo(Component$2);

var Component$1 = function Component(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  React__default['default'].Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return React__default['default'].createElement(React__default['default'].Fragment, null, arr);
  }

  return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
};

var Else = React__default['default'].memo(Component$1);

var Component = function Component(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  React__default['default'].Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return React__default['default'].createElement(React__default['default'].Fragment, null, arr[0]);
  }

  return React__default['default'].createElement(React__default['default'].Fragment, null, elseView);
};

var Switch = React__default['default'].memo(Component);

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

var Link = React__default['default'].forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      replace = _ref.replace,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "replace"]);

  var target = rest.target;

  var props = _extends({}, rest, {
    onClick: function onClick(event) {
      try {
        _onClick && _onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? MetaData.router.replace(rest.href) : MetaData.router.push(rest.href);
        }
    }
  });

  return React__default['default'].createElement("a", _extends({}, props, {
    ref: ref
  }));
});

var SSRTPL;
function setSsrHtmlTpl(tpl) {
  if (tpl) {
    SSRTPL = tpl;
  }
}
function setConfig(conf) {
  setConfig$1(conf);
  setRouteConfig(conf);
  setLoadComponentOptions(conf);
}
function createApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref) {
      var storeOptions = _ref.storeOptions,
          storeCreator = _ref.storeCreator;
      return {
        render: function render(_temp) {
          var _ref2 = _temp === void 0 ? {} : _temp,
              _ref2$id = _ref2.id,
              id = _ref2$id === void 0 ? 'root' : _ref2$id,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = createRouter('Browser', routeModule.locationTransform);
          MetaData.router = router;
          var renderFun = env[ssrKey] ? reactDom.hydrate : reactDom.render;

          var _ref3 = env[ssrKey] || {},
              state = _ref3.state,
              _ref3$components = _ref3.components,
              components = _ref3$components === void 0 ? [] : _ref3$components;

          var panel = env.document.getElementById(id);
          return router.initedPromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            }, state);

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref4) {
              var store = _ref4.store,
                  AppView = _ref4.AppView;
              var RootView = AppView;
              routeModule.model(store);
              router.setStore(store);
              var eluxContext = {
                store: store,
                documentHead: ''
              };
              renderFun(React__default['default'].createElement(EluxContext.Provider, {
                value: eluxContext
              }, React__default['default'].createElement(RootView, {
                store: store
              })), panel);
              return store;
            });
          });
        }
      };
    }
  };
}
function createSsrApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  setSsrHtmlTpl('');
  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref5) {
      var storeOptions = _ref5.storeOptions,
          storeCreator = _ref5.storeCreator;
      return {
        render: function render(_ref6) {
          var _ref6$id = _ref6.id,
              id = _ref6$id === void 0 ? 'root' : _ref6$id,
              _ref6$ssrKey = _ref6.ssrKey,
              ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
              url = _ref6.url,
              viewName = _ref6.viewName;

          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          var router = createRouter(url, routeModule.locationTransform);
          MetaData.router = router;
          return router.initedPromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            });

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref7) {
              var store = _ref7.store,
                  AppView = _ref7.AppView;
              var RootView = AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                documentHead: ''
              };

              var html = require('react-dom/server').renderToString(React__default['default'].createElement(EluxContext.Provider, {
                value: eluxContext
              }, React__default['default'].createElement(RootView, {
                store: store
              })));

              var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

              if (match) {
                return SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                  state: state,
                  components: Object.keys(eluxContext.deps)
                }) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
              }

              return html;
            });
          });
        }
      };
    }
  };
}
function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
function getApp() {
  var modules = getRootModuleAPI();
  return {
    GetActions: function GetActions() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: function GetRouter() {
      return MetaData.router;
    },
    LoadComponent: loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}

Object.defineProperty(exports, 'Provider', {
  enumerable: true,
  get: function () {
    return reactWebRedux.Provider;
  }
});
Object.defineProperty(exports, 'connectRedux', {
  enumerable: true,
  get: function () {
    return reactWebRedux.connectRedux;
  }
});
Object.defineProperty(exports, 'createRedux', {
  enumerable: true,
  get: function () {
    return reactWebRedux.createRedux;
  }
});
exports.ActionTypes = ActionTypes;
exports.BaseModuleHandlers = ModuleWithRouteHandlers;
exports.DocumentHead = DocumentHead;
exports.Else = Else;
exports.EmptyModuleHandlers = EmptyModuleHandlers;
exports.Link = Link;
exports.RouteActionTypes = RouteActionTypes;
exports.Switch = Switch;
exports.clientSide = clientSide;
exports.createApp = createApp;
exports.createRouteModule = createRouteModule;
exports.createSsrApp = createSsrApp;
exports.deepMerge = deepMerge;
exports.deepMergeState = deepMergeState;
exports.delayPromise = delayPromise;
exports.effect = effect;
exports.env = env;
exports.errorAction = errorAction;
exports.exportComponent = exportComponent;
exports.exportModule = exportModule;
exports.exportView = exportView;
exports.getApp = getApp;
exports.isProcessedError = isProcessedError;
exports.isServer = isServer;
exports.logger = logger;
exports.patchActions = patchActions;
exports.reducer = reducer;
exports.serverSide = serverSide;
exports.setConfig = setConfig;
exports.setLoading = setLoading;
exports.setProcessedError = setProcessedError;
exports.setSsrHtmlTpl = setSsrHtmlTpl;
