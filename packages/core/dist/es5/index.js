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
  root = new Function('return this')();
}

var env = root;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

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

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function deepCloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
function promiseCaseCallback(resultOrPromise, callback) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise.then(function (result) {
      return callback(result);
    });
  }

  return callback(resultOrPromise);
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
var SingleDispatcher = function () {
  function SingleDispatcher() {
    this.listenerId = 0;
    this.listenerMap = {};
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

    if (deferSecond === void 0) {
      deferSecond = 1;
    }

    _this = _SingleDispatcher.call(this) || this;
    _this.list = [];
    _this.ctimer = 0;
    _this.deferSecond = deferSecond;
    return _this;
  }

  var _proto2 = TaskCounter.prototype;

  _proto2.addItem = function addItem(promise, note) {
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
        this.dispatch('Start');
        this.ctimer = env.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch('Depth');
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto2.completeItem = function completeItem(promise) {
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

        this.dispatch('Stop');
      }
    }

    return this;
  };

  return TaskCounter;
}(SingleDispatcher);
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}
function isServer() {
  return env.isServer;
}
function toPromise(resultOrPromise) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise;
  }

  return Promise.resolve(resultOrPromise);
}

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
function testRouteChangeAction(location, routeAction) {
  return {
    type: "" + actionConfig.StageModuleName + actionConfig.NSP + "_testRouteChange",
    payload: [location, routeAction]
  };
}
function beforeRouteChangeAction(location, routeAction) {
  return {
    type: "" + actionConfig.StageModuleName + actionConfig.NSP + "_beforeRouteChange",
    payload: [location, routeAction]
  };
}
function afterRouteChangeAction(location, routeAction) {
  return {
    type: "" + actionConfig.StageModuleName + actionConfig.NSP + "_afterRouteChange",
    payload: [location, routeAction]
  };
}
function initModuleSuccessAction(moduleName, initState) {
  return {
    type: "" + moduleName + actionConfig.NSP + "_initState",
    payload: [initState]
  };
}
function initModuleErrorAction(moduleName, error) {
  var initState = {
    _error: error + ''
  };
  return {
    type: "" + moduleName + actionConfig.NSP + "_initState",
    payload: [initState]
  };
}
function isInitAction(action) {
  var _action$type$split = action.type.split(actionConfig.NSP),
      actionName = _action$type$split[1];

  return actionName === '_initState';
}
function loadingAction(moduleName, groupName, loadingState) {
  var _ref;

  return {
    type: "" + moduleName + actionConfig.NSP + "_loading",
    payload: [(_ref = {}, _ref[groupName] = loadingState, _ref)]
  };
}
var errorProcessed = '__eluxProcessed__';
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
function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  var processed = !!error[errorProcessed];
  var _error = error,
      _error$code = _error.code,
      code = _error$code === void 0 ? '' : _error$code,
      _error$message = _error.message,
      message = _error$message === void 0 ? 'unkown error' : _error$message,
      detail = _error.detail;
  var actionError = {
    code: code,
    message: message,
    detail: detail
  };
  Object.defineProperty(actionError, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return {
    type: "" + actionConfig.StageModuleName + actionConfig.NSP + "_error",
    payload: [actionError]
  };
}
function setProcessedErrorAction(errorAction) {
  var actionData = getActionData(errorAction);

  if (isProcessedError(actionData[0])) {
    return undefined;
  }

  actionData[0] = setProcessedError(actionData[0], true);
  return errorAction;
}
function isErrorAction(action) {
  return action.type === "" + actionConfig.StageModuleName + actionConfig.NSP + "_error";
}
var actionConfig = {
  NSP: '.',
  StageModuleName: 'stage'
};

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

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
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
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
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
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
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

  define(Gp, iteratorSymbol, function () {
    return this;
  });
  define(Gp, "toString", function () {
    return "[object Generator]";
  });

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
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
});

var regenerator = runtime_1;

function isEluxComponent(data) {
  return data['__elux_component__'];
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
var RouteRecord = function () {
  function RouteRecord(location, pageStack, store) {
    this.key = void 0;
    this._title = '';
    this.location = location;
    this.pageStack = pageStack;
    this.store = store;
    this.key = [pageStack.key, pageStack.num++].join('_');
  }

  var _proto = RouteRecord.prototype;

  _proto.destroy = function destroy() {
    this.store.destroy();
  };

  _proto.active = function active() {
    this.store.setActive(true);
  };

  _proto.inactive = function inactive() {
    this.store.setActive(false);
  };

  _proto.saveTitle = function saveTitle(val) {
    this._title = val;
  };

  _createClass(RouteRecord, [{
    key: "title",
    get: function get() {
      return this._title;
    }
  }]);

  return RouteRecord;
}();
var ErrorCodes = {
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
var AStore = function () {
  function AStore(sid, uid, router) {
    this.dispatch = void 0;
    this.getState = void 0;
    this.mountedModules = {};
    this.injectedModels = {};
    this._active = false;
    this.sid = sid;
    this.uid = uid;
    this.router = router;
  }

  var _proto2 = AStore.prototype;

  _proto2.mount = function mount(moduleName, env) {
    if (!baseConfig.ModuleGetter[moduleName]) {
      return;
    }

    var mountedModules = this.mountedModules;

    if (!mountedModules[moduleName]) {
      mountedModules[moduleName] = this.execMount(moduleName);
    }

    var result = mountedModules[moduleName];
    return result === true ? undefined : result;
  };

  _proto2.execMount = function () {
    var _execMount = _asyncToGenerator(regenerator.mark(function _callee(moduleName) {
      var model, initState, initError, module;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return baseConfig.GetModule(moduleName);

            case 3:
              module = _context.sent;
              model = new module.ModelClass(moduleName, this);
              _context.next = 7;
              return model.onInit();

            case 7:
              initState = _context.sent;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](0);
              initError = _context.t0;

            case 13:
              if (!initError) {
                _context.next = 17;
                break;
              }

              this.dispatch(initModuleErrorAction(moduleName, initError));
              this.mountedModules[moduleName] = undefined;
              throw initError;

            case 17:
              this.dispatch(initModuleSuccessAction(moduleName, initState));
              this.mountedModules[moduleName] = true;
              this.injectedModels[moduleName] = model;

              if (this.active) {
                model.onActive();
              }

              model.onBuild();

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 10]]);
    }));

    function execMount(_x) {
      return _execMount.apply(this, arguments);
    }

    return execMount;
  }();

  _createClass(AStore, [{
    key: "active",
    get: function get() {
      return this._active;
    }
  }]);

  return AStore;
}();
var clientDocumentHeadTimer = 0;
var ARouter = function () {
  function ARouter(nativeRouter) {
    var _this = this;

    this.WindowStackClass = void 0;
    this.PageStackClass = void 0;
    this.StoreClass = void 0;
    this.action = 'init';
    this.prevState = {};
    this.context = {};
    this.nativeRouter = void 0;
    this.taskList = [];
    this.curTask = void 0;
    this.curTaskError = void 0;
    this.curLoopTaskCallback = void 0;
    this.documentHead = '';

    this.onTaskComplete = function () {
      var task = _this.taskList.shift();

      if (task) {
        _this.curTask = task;
        _this.curTaskError = undefined;
        var onTaskComplete = _this.onTaskComplete;
        var exec = task[0],
            resolve = task[1],
            reject = task[2];
        env.setTimeout(function () {
          return exec().then(onTaskComplete, function (reason) {
            _this.curTaskError = reason;
            onTaskComplete();
            throw reason;
          }).then(resolve, reject);
        }, 0);
      } else {
        _this.curTask = undefined;

        if (_this.curLoopTaskCallback) {
          var _this$curLoopTaskCall = _this.curLoopTaskCallback,
              _resolve = _this$curLoopTaskCall[0],
              _reject = _this$curLoopTaskCall[1];

          if (_this.curTaskError) {
            _reject(_this.curTaskError);
          } else {
            _resolve();
          }
        }
      }
    };

    this.nativeRouter = nativeRouter;
    baseConfig.ClientRouter = this;
  }

  var _proto3 = ARouter.prototype;

  _proto3.addTask = function addTask(exec) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      var task = [exec, resolve, reject];

      if (_this2.curTask) {
        _this2.taskList.push(task);
      } else {
        _this2.curTask = task;
        _this2.curTaskError = undefined;
        var onTaskComplete = _this2.onTaskComplete;
        var _exec = task[0],
            _resolve2 = task[1],
            _reject2 = task[2];

        _exec().then(onTaskComplete, function (reason) {
          _this2.curTaskError = reason;
          onTaskComplete();
          throw reason;
        }).then(_resolve2, _reject2);
      }
    });
  };

  _proto3.getHistoryLength = function getHistoryLength(target) {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  };

  _proto3.findRecordByKey = function findRecordByKey(recordKey) {
    return this.windowStack.findRecordByKey(recordKey);
  };

  _proto3.findRecordByStep = function findRecordByStep(delta, rootOnly) {
    return this.windowStack.backTest(delta, !!rootOnly);
  };

  _proto3.getWindowPages = function getWindowPages() {
    return this.windowStack.getRecords();
  };

  _proto3.getCurrentPage = function getCurrentPage() {
    return this.windowStack.getCurrentItem().getCurrentItem();
  };

  _proto3.getHistory = function getHistory(target) {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  };

  _proto3.getDocumentTitle = function getDocumentTitle() {
    var arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    return arr[1] || '';
  };

  _proto3.getDocumentHead = function getDocumentHead() {
    return this.documentHead;
  };

  _proto3.setDocumentHead = function setDocumentHead(html) {
    var _this3 = this;

    this.documentHead = html;

    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(function () {
        clientDocumentHeadTimer = 0;
        var arr = _this3.documentHead.match(/<title>(.*?)<\/title>/) || [];

        if (arr[1]) {
          _this3.nativeRouter.setPageTitle(arr[1]);
        }
      }, 0);
    }
  };

  _proto3.getLocation = function getLocation() {
    return this.getCurrentPage().location;
  };

  _proto3.computeUrl = function computeUrl(partialLocation, action, target) {
    var curClassname = this.getLocation().classname;
    var defClassname = curClassname;

    if (action === 'relaunch') {
      defClassname = target === 'window' ? '' : curClassname;
    }

    return this.locationToUrl(partialLocation, defClassname);
  };

  _proto3.mountStore = function mountStore(prevStore, newStore) {
    var prevState = prevStore.getState();
    this.prevState = baseConfig.MutableData ? deepCloneState(prevState) : prevState;
    return newStore.mount(actionConfig.StageModuleName, 'route');
  };

  _proto3.initialize = function initialize() {
    var _this4 = this;

    return this.nativeRouter.getInitData().then(function (_ref) {
      var nativeUrl = _ref.url,
          state = _ref.state,
          context = _ref.context;
      _this4.context = context;
      _this4.prevState = state;

      var url = _this4.nativeUrlToUrl(nativeUrl);

      var location = _this4.urlToLocation(url);

      _this4.windowStack = new _this4.WindowStackClass(location, new _this4.StoreClass(0, 0, _this4));
      var task = [_this4._init.bind(_this4), function () {
        return undefined;
      }, function () {
        return undefined;
      }];
      _this4.curTask = task;
      return new Promise(function (resolve, reject) {
        _this4.curLoopTaskCallback = [resolve, reject];
        task[0]().finally(_this4.onTaskComplete);
      });
    });
  };

  _proto3._init = function () {
    var _init2 = _asyncToGenerator(regenerator.mark(function _callee2() {
      var store;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              store = this.getCurrentPage().store;
              _context2.prev = 1;
              _context2.next = 4;
              return store.mount(actionConfig.StageModuleName, 'init');

            case 4:
              _context2.next = 9;
              break;

            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](1);
              env.console.error(_context2.t0);

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[1, 6]]);
    }));

    function _init() {
      return _init2.apply(this, arguments);
    }

    return _init;
  }();

  _proto3.ssr = function ssr(html) {
    return this.addTask(this._ssr.bind(this, html));
  };

  _proto3._ssr = function () {
    var _ssr2 = _asyncToGenerator(regenerator.mark(function _callee3(html) {
      var err;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              err = {
                code: ErrorCodes.ROUTE_RETURN,
                message: 'Route cutting out',
                detail: html
              };
              throw err;

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    function _ssr(_x2) {
      return _ssr2.apply(this, arguments);
    }

    return _ssr;
  }();

  return ARouter;
}();
var WebApp = function () {
  function WebApp() {
    this.cientSingleton = void 0;
    this.NativeRouterClass = void 0;
    this.RouterClass = void 0;
    this.createUI = void 0;
    this.toDocument = void 0;
  }

  var _proto4 = WebApp.prototype;

  _proto4.boot = function boot() {
    if (this.cientSingleton) {
      return this.cientSingleton;
    }

    var ssrData = env[baseConfig.SSRDataKey];
    var nativeRouter = new this.NativeRouterClass();
    var router = new this.RouterClass(nativeRouter, ssrData);
    var ui = this.createUI();
    this.cientSingleton = Object.assign(ui, {
      render: function render() {
        return Promise.resolve();
      }
    });
    var toDocument = this.toDocument;
    return Object.assign(ui, {
      render: function render(_temp) {
        var _ref2 = _temp === void 0 ? {} : _temp,
            _ref2$id = _ref2.id,
            id = _ref2$id === void 0 ? 'root' : _ref2$id;

        return router.initialize().then(function () {
          toDocument(id, router, !!ssrData, ui);
        });
      }
    });
  };

  return WebApp;
}();
var SsrApp = function () {
  function SsrApp() {
    this.NativeRouterClass = void 0;
    this.RouterClass = void 0;
    this.createUI = void 0;
    this.toString = void 0;
  }

  var _proto5 = SsrApp.prototype;

  _proto5.boot = function boot() {
    var nativeRouter = new this.NativeRouterClass();
    var router = new this.RouterClass(nativeRouter, {});
    var ui = this.createUI();
    var toString = this.toString;
    return Object.assign(ui, {
      render: function render(_temp2) {
        var _ref3 = _temp2 === void 0 ? {} : _temp2,
            _ref3$id = _ref3.id,
            id = _ref3$id === void 0 ? 'root' : _ref3$id;

        return router.initialize().then(function () {
          var store = router.getCurrentPage().store;
          store.destroy();
          toString(id, router, ui);
        });
      }
    });
  };

  return SsrApp;
}();
function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (baseConfig.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}
var baseConfig = {
  MutableData: false,
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  ClientRouter: undefined,
  GetModule: undefined,
  ModuleGetter: undefined
};

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

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(function (_ref) {
    var type = _ref.type,
        payload = _ref.payload;

    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

var effects = [];
var devLogger = function devLogger(_ref2) {
  var id = _ref2.id,
      isActive = _ref2.isActive,
      actionName = _ref2.actionName,
      payload = _ref2.payload,
      priority = _ref2.priority,
      handers = _ref2.handers,
      state = _ref2.state,
      effect = _ref2.effect;

  if (reduxDevTools) {
    var type = ["" + id + (isActive ? '' : '*') + "|", actionName, "(" + handers.length + ")"].join('');
    var _logItem = {
      type: type,
      payload: payload,
      priority: priority,
      handers: handers
    };

    if (effect) {
      effects.push(_logItem);
    } else {
      _logItem.effects = [].concat(effects);
      effects.length = 0;
      reduxDevTools.send(_logItem, state);
    }
  }
};

var preMiddleware = function preMiddleware(_ref) {
  var getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (isErrorAction(action)) {
        var processedErrorAction = setProcessedErrorAction(action);

        if (!processedErrorAction) {
          return undefined;
        }

        action = processedErrorAction;
      }

      var _action$type$split = action.type.split(actionConfig.NSP),
          moduleName = _action$type$split[0],
          actionName = _action$type$split[1];

      if (!moduleName || !actionName || !baseConfig.ModuleGetter[moduleName]) {
        return undefined;
      }

      var store = getStore();
      var moduleState = store.getState(moduleName);

      if ((!moduleState || moduleState._error) && !isInitAction(action)) {
        return promiseCaseCallback(store.mount(moduleName, 'update'), function () {
          return next(action);
        });
      }

      return next(action);
    };
  };
};
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
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (!env.isServer) {
      fun.__loadingKey__ = loadingKey;
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
var Store = function (_AStore) {
  _inheritsLoose(Store, _AStore);

  function Store(sid, uid, router) {
    var _this;

    _this = _AStore.call(this, sid, uid, router) || this;
    _this.state = storeConfig.StoreInitState();
    _this.uncommittedState = {};
    _this.loadingGroups = {};
    _this.listenerId = 0;
    _this.listenerMap = {};
    _this.currentAction = void 0;
    _this.listeners = [];

    _this.dispatch = function (action) {
      throw 'Dispatching action while constructing your middleware is not allowed.';
    };

    _this.getState = function (moduleName) {
      return moduleName ? _this.state[moduleName] : _this.state;
    };

    var middlewareAPI = {
      getStore: function getStore() {
        return _assertThisInitialized(_this);
      },
      dispatch: function dispatch(action) {
        return _this.dispatch(action);
      }
    };

    var _dispatch = function _dispatch(action) {
      _this.respondHandler(action, true);

      return _this.respondHandler(action, false);
    };

    var chain = [preMiddleware].concat(storeConfig.StoreMiddlewares).map(function (middleware) {
      return middleware(middlewareAPI);
    });
    _this.dispatch = compose.apply(void 0, chain)(_dispatch);
    return _this;
  }

  var _proto = Store.prototype;

  _proto.getUncommittedState = function getUncommittedState() {
    return this.uncommittedState;
  };

  _proto.clone = function clone(brand) {
    return new Store(this.sid + 1, brand ? this.uid + 1 : this.uid, this.router);
  };

  _proto.getCurrentAction = function getCurrentAction() {
    return this.currentAction;
  };

  _proto.setActive = function setActive(active) {
    var _this2 = this;

    if (this._active !== active) {
      this._active = active;
      Object.keys(this.injectedModels).forEach(function (moduleName) {
        var model = _this2.injectedModels[moduleName];
        active ? model.onActive() : model.onInactive();
      });
    }
  };

  _proto.destroy = function destroy() {
    this.setActive(false);

    this.dispatch = function () {};

    this.mount = function () {};
  };

  _proto.setLoading = function setLoading(item, groupName, moduleName) {
    var _this3 = this;

    if (!moduleName) {
      moduleName = actionConfig.StageModuleName;
    }

    var key = moduleName + actionConfig.NSP + groupName;
    var loadings = this.loadingGroups;

    if (!loadings[key]) {
      loadings[key] = new TaskCounter();
      loadings[key].addListener(function (loadingState) {
        var action = loadingAction(moduleName, groupName, loadingState);

        _this3.dispatch(action);
      });
    }

    loadings[key].addItem(item);
    return item;
  };

  _proto.subscribe = function subscribe(listener) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = listener;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.update = function update(newState) {
    this.state = mergeState(this.state, newState);
    var listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(function (id) {
      if (listenerMap[id]) {
        listenerMap[id]();
      }
    });
  };

  _proto.respondHandler = function respondHandler(action, isReducer) {
    var _this4 = this;

    var handlersMap = isReducer ? storeConfig.ReducersMap : storeConfig.EffectsMap;
    var actionType = action.type;
    var actionPriority = action.priority || [];
    var actionData = getActionData(action);

    var _actionType$split = actionType.split(actionConfig.NSP),
        actionModuleName = _actionType$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionType.replace(new RegExp("[^" + actionConfig.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];

    var handlers = _extends({}, commonHandlers, universalHandlers);

    var handlerModuleNames = Object.keys(handlers);
    var logs = {
      id: this.sid,
      isActive: this.active,
      actionName: actionType,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer
    };

    if (handlerModuleNames.length > 0) {
      var _orderList;

      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      (_orderList = orderList).unshift.apply(_orderList, actionPriority);

      var injectedModels = this.injectedModels;
      var implemented = {};
      orderList = orderList.filter(function (moduleName) {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;

      if (isReducer) {
        var prevState = this.getState();
        var newState = {};

        var uncommittedState = this.uncommittedState = _extends({}, prevState);

        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          var result = handler.apply(model, actionData);

          if (result) {
            newState[moduleName] = result;
            uncommittedState[moduleName] = result;
          }
        });
        logs.state = uncommittedState;
        devLogger(logs);
        this.update(newState);
      } else {
        devLogger(logs);
        var effectPromises = [];
        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          _this4.currentAction = action;
          var result = handler.apply(model, actionData);
          var loadingKey = handler.__loadingKey__;

          if (isPromise(result)) {
            if (loadingKey) {
              var _loadingKey$split = loadingKey.split('.'),
                  loadingForModuleName = _loadingKey$split[0],
                  loadingForGroupName = _loadingKey$split[1];

              if (!loadingForGroupName) {
                loadingForModuleName = actionConfig.StageModuleName;
                loadingForGroupName = loadingForModuleName;
              }

              if (loadingForModuleName === 'this') {
                loadingForModuleName = moduleName;
              }

              _this4.setLoading(result, loadingForGroupName, loadingForModuleName);
            }

            effectPromises.push(result);
          }
        });

        if (effectPromises.length === 0) {
          return;
        }

        return effectPromises.length === 1 ? effectPromises[0] : Promise.all(effectPromises);
      }
    } else {
      if (isReducer) {
        devLogger(logs);
      } else if (isErrorAction(action)) {
        return Promise.reject(actionData);
      }
    }
  };

  return Store;
}(AStore);
var storeConfig = {
  StoreInitState: function StoreInitState() {
    return {};
  },
  StoreMiddlewares: [],
  StoreLogger: function StoreLogger() {
    return undefined;
  },
  ReducersMap: {},
  EffectsMap: {}
};

var HistoryStack = function () {
  function HistoryStack(limit) {
    if (limit === void 0) {
      limit = 10;
    }

    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  var _proto = HistoryStack.prototype;

  _proto.init = function init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.active();
  };

  _proto.onChanged = function onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.inactive();
      this.currentRecord = this.records[0];
      this.currentRecord.active();
    }
  };

  _proto.getCurrentItem = function getCurrentItem() {
    return this.currentRecord;
  };

  _proto.getEarliestItem = function getEarliestItem() {
    return this.records[this.records.length - 1];
  };

  _proto.getItemAt = function getItemAt(n) {
    return this.records[n];
  };

  _proto.getItems = function getItems() {
    return [].concat(this.records);
  };

  _proto.getLength = function getLength() {
    return this.records.length;
  };

  _proto.push = function push(item) {
    var records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      var delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  };

  _proto.replace = function replace(item) {
    var records = this.records;
    var delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  };

  _proto.relaunch = function relaunch(item) {
    var delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(function (delItem) {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  };

  _proto.back = function back(delta) {
    var delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      var last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(function (delItem) {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.onChanged();
  };

  return HistoryStack;
}();
var PageStack = function (_HistoryStack) {
  _inheritsLoose(PageStack, _HistoryStack);

  function PageStack(windowStack, location, store) {
    var _this;

    _this = _HistoryStack.call(this) || this;
    _this.num = 0;
    _this.key = void 0;
    _this.windowStack = windowStack;
    _this.key = '' + windowStack.num++;

    _this.init(new RouteRecord(location, _assertThisInitialized(_this), store));

    return _this;
  }

  var _proto2 = PageStack.prototype;

  _proto2.findRecordByKey = function findRecordByKey(key) {
    for (var i = 0, k = this.records.length; i < k; i++) {
      var item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  };

  _proto2.active = function active() {
    this.getCurrentItem().active();
  };

  _proto2.inactive = function inactive() {
    this.getCurrentItem().inactive();
  };

  _proto2.destroy = function destroy() {
    this.records.forEach(function (item) {
      item.destroy();
    });
  };

  return PageStack;
}(HistoryStack);
var WindowStack = function (_HistoryStack2) {
  _inheritsLoose(WindowStack, _HistoryStack2);

  function WindowStack(location, store) {
    var _this2;

    _this2 = _HistoryStack2.call(this) || this;
    _this2.num = 0;

    _this2.init(new PageStack(_assertThisInitialized(_this2), location, store));

    return _this2;
  }

  var _proto3 = WindowStack.prototype;

  _proto3.getRecords = function getRecords() {
    return this.records.map(function (item) {
      return item.getCurrentItem();
    });
  };

  _proto3.countBack = function countBack(delta) {
    var historyStacks = this.records;
    var backSteps = [0, 0];

    for (var i = 0, k = historyStacks.length; i < k; i++) {
      var pageStack = historyStacks[i];
      var recordNum = pageStack.getLength();
      delta = delta - recordNum;

      if (delta > 0) {
        backSteps[0]++;
      } else if (delta === 0) {
        backSteps[0]++;
        break;
      } else {
        backSteps[1] = recordNum + delta;
        break;
      }
    }

    return backSteps;
  };

  _proto3.backTest = function backTest(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    var delta = stepOrKey;

    if (delta === 0) {
      var _record = this.getCurrentItem().getCurrentItem();

      return {
        record: _record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        var _record2 = this.getEarliestItem().getCurrentItem();

        return {
          record: _record2,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        var _record3 = this.getItemAt(delta).getCurrentItem();

        return {
          record: _record3,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      var pageStack = this.getEarliestItem();

      var _record4 = pageStack.getEarliestItem();

      return {
        record: _record4,
        overflow: false,
        index: [this.records.length - 1, pageStack.getLength() - 1]
      };
    }

    var _this$countBack = this.countBack(delta),
        rootDelta = _this$countBack[0],
        recordDelta = _this$countBack[1];

    if (rootDelta < this.records.length) {
      var _record5 = this.getItemAt(rootDelta).getItemAt(recordDelta);

      return {
        record: _record5,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      var _pageStack = this.getEarliestItem();

      var _record6 = _pageStack.getEarliestItem();

      return {
        record: _record6,
        overflow: true,
        index: [this.records.length - 1, _pageStack.getLength() - 1]
      };
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('_');

    if (arr[0] && arr[1]) {
      for (var i = 0, k = this.records.length; i < k; i++) {
        var pageStack = this.records[i];

        if (pageStack.key === arr[0]) {
          var item = pageStack.findRecordByKey(key);

          if (item) {
            return {
              record: item[0],
              index: [i, item[1]],
              overflow: false
            };
          }
        }
      }
    }

    return {
      record: this.getCurrentItem().getCurrentItem(),
      index: [0, 0],
      overflow: true
    };
  };

  return WindowStack;
}(HistoryStack);
function locationToNativeLocation(location) {
  var pathname = routerConfig.NativePathnameMapping.out(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends({}, location, {
    pathname: pathname,
    url: url
  });
}
function nativeLocationToLocation(location) {
  var pathname = routerConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends({}, location, {
    pathname: pathname,
    url: url
  });
}

function _nativeUrlToUrl(nativeUrl) {
  var _nativeUrl$split = nativeUrl.split(/[?#]/),
      _nativeUrl$split$ = _nativeUrl$split[0],
      path = _nativeUrl$split$ === void 0 ? '' : _nativeUrl$split$,
      _nativeUrl$split$2 = _nativeUrl$split[1],
      search = _nativeUrl$split$2 === void 0 ? '' : _nativeUrl$split$2,
      _nativeUrl$split$3 = _nativeUrl$split[2],
      hash = _nativeUrl$split$3 === void 0 ? '' : _nativeUrl$split$3;

  var pathname = routerConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
}
function urlToNativeUrl(eluxUrl) {
  var _eluxUrl$split = eluxUrl.split(/[?#]/),
      _eluxUrl$split$ = _eluxUrl$split[0],
      path = _eluxUrl$split$ === void 0 ? '' : _eluxUrl$split$,
      _eluxUrl$split$2 = _eluxUrl$split[1],
      search = _eluxUrl$split$2 === void 0 ? '' : _eluxUrl$split$2,
      _eluxUrl$split$3 = _eluxUrl$split[2],
      hash = _eluxUrl$split$3 === void 0 ? '' : _eluxUrl$split$3;

  var pathname = routerConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
}

function _urlToLocation(url, state) {
  var _url$split = url.split(/[?#]/),
      _url$split$ = _url$split[0],
      path = _url$split$ === void 0 ? '' : _url$split$,
      _url$split$2 = _url$split[1],
      query = _url$split$2 === void 0 ? '' : _url$split$2,
      _url$split$3 = _url$split[2],
      hash = _url$split$3 === void 0 ? '' : _url$split$3;

  var arr = ("?" + query).match(/[?&]__c=([^&]*)/) || ['', ''];
  var classname = arr[1];
  var search = ("?" + query).replace(/[?&]__c=[^&]*/g, '').substring(1);
  var pathname = '/' + path.replace(/^\/|\/$/g, '');
  var parse = routerConfig.QueryString.parse;
  var searchQuery = parse(search);
  var hashQuery = parse(hash);

  if (classname) {
    search = search ? search + "&__c=" + classname : "__c=" + classname;
  }

  return {
    url: "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : ''),
    pathname: pathname,
    search: search,
    hash: hash,
    classname: classname,
    searchQuery: searchQuery,
    hashQuery: hashQuery,
    state: state
  };
}

function _locationToUrl(_ref, defClassname) {
  var url = _ref.url,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash,
      classname = _ref.classname,
      searchQuery = _ref.searchQuery,
      hashQuery = _ref.hashQuery;

  if (url) {
    var _url$split2 = url.split(/[?#]/);

    pathname = _url$split2[0];
    search = _url$split2[1];
    hash = _url$split2[2];
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  var stringify = routerConfig.QueryString.stringify;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';

  if (!/[?&]__c=/.test("?" + search) && defClassname && classname === undefined) {
    classname = defClassname;
  }

  if (typeof classname === 'string') {
    search = ("?" + search).replace(/[?&]__c=[^&]*/g, '').substring(1);

    if (classname) {
      search = search ? search + "&__c=" + classname : "__c=" + classname;
    }
  }

  url = "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
  return url;
}
var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    this.routeKey = '';
    this.curTask = void 0;
  }

  var _proto4 = BaseNativeRouter.prototype;

  _proto4.onSuccess = function onSuccess() {
    if (this.curTask) {
      var _this$curTask = this.curTask,
          resolve = _this$curTask.resolve,
          timeout = _this$curTask.timeout;
      this.curTask = undefined;
      env.clearTimeout(timeout);
      this.routeKey = '';
      resolve();
    }
  };

  _proto4.testExecute = function testExecute(method, location, backIndex) {
    var testMethod = '_' + method;

    if (this[testMethod]) {
      return this[testMethod](locationToNativeLocation(location), backIndex);
    }
  };

  _proto4.execute = function execute(method, location, key, backIndex) {
    var _this3 = this;

    var nativeLocation = locationToNativeLocation(location);
    var result = this[method](nativeLocation, key, backIndex);

    if (result) {
      this.routeKey = key;
      return new Promise(function (resolve) {
        var timeout = env.setTimeout(function () {
          env.console.error('Native router timeout: ' + nativeLocation.url);

          _this3.onSuccess();
        }, 2000);
        _this3.curTask = {
          resolve: resolve,
          timeout: timeout
        };
      });
    }
  };

  return BaseNativeRouter;
}();
var Router = function (_ARouter) {
  _inheritsLoose(Router, _ARouter);

  function Router() {
    var _this4;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this4 = _ARouter.call.apply(_ARouter, [this].concat(args)) || this;
    _this4.WindowStackClass = WindowStack;
    _this4.PageStackClass = PageStack;
    _this4.StoreClass = Store;
    _this4.listenerId = 0;
    _this4.listenerMap = {};
    return _this4;
  }

  var _proto5 = Router.prototype;

  _proto5.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var promiseResults = [];
    Object.keys(listenerMap).forEach(function (id) {
      var result = listenerMap[id](data);

      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });

    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(function () {
        return undefined;
      });
    }
  };

  _proto5.nativeUrlToUrl = function nativeUrlToUrl(nativeUrl) {
    return _nativeUrlToUrl(nativeUrl);
  };

  _proto5.urlToLocation = function urlToLocation(url, state) {
    return _urlToLocation(url, state);
  };

  _proto5.locationToUrl = function locationToUrl(location, defClassname) {
    return _locationToUrl(location, defClassname);
  };

  _proto5.needToNotifyNativeRouter = function needToNotifyNativeRouter(action, target) {
    return routerConfig.NeedToNotifyNativeRouter(action, target);
  };

  _proto5.addListener = function addListener(callback) {
    this.listenerId++;
    var id = this.listenerId + '';
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto5.relaunch = function relaunch(partialLocation, target, refresh, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto5._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(regenerator.mark(function _callee(partialLocation, target, refresh, nativeCaller) {
      var action, url, location, needToNotifyNativeRouter, reject, curPage, newStore, curPageStack, newRecord;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              action = 'relaunch';
              url = this.computeUrl(partialLocation, action, target);
              location = this.urlToLocation(url, partialLocation.state);
              needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context.next = 8;
                break;
              }

              reject = this.nativeRouter.testExecute(action, location);

              if (!reject) {
                _context.next = 8;
                break;
              }

              throw reject;

            case 8:
              curPage = this.getCurrentPage();
              _context.prev = 9;
              _context.next = 12;
              return curPage.store.dispatch(testRouteChangeAction(location, action));

            case 12:
              _context.next = 18;
              break;

            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](9);

              if (nativeCaller) {
                _context.next = 18;
                break;
              }

              throw _context.t0;

            case 18:
              _context.next = 20;
              return curPage.store.dispatch(beforeRouteChangeAction(location, action));

            case 20:
              curPage.saveTitle(this.getDocumentTitle());
              this.action = action;
              newStore = curPage.store.clone(refresh);
              curPageStack = this.windowStack.getCurrentItem();
              newRecord = new RouteRecord(location, curPageStack, newStore);

              if (target === 'window') {
                curPageStack.relaunch(newRecord);
                this.windowStack.relaunch(curPageStack);
              } else {
                curPageStack.relaunch(newRecord);
              }

              _context.prev = 26;
              _context.next = 29;
              return this.mountStore(curPage.store, newStore);

            case 29:
              _context.next = 34;
              break;

            case 31:
              _context.prev = 31;
              _context.t1 = _context["catch"](26);
              env.console.error(_context.t1);

            case 34:
              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context.next = 37;
                break;
              }

              _context.next = 37;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 37:
              _context.next = 39;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: curPage.store,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 39:
              newStore.dispatch(afterRouteChangeAction(location, action));

            case 40:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[9, 14], [26, 31]]);
    }));

    function _relaunch(_x, _x2, _x3, _x4) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto5.replace = function replace(partialLocation, target, refresh, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto5._replace = function () {
    var _replace2 = _asyncToGenerator(regenerator.mark(function _callee2(partialLocation, target, refresh, nativeCaller) {
      var action, url, location, needToNotifyNativeRouter, reject, curPage, newStore, curPageStack, newRecord;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              action = 'replace';
              url = this.computeUrl(partialLocation, action, target);
              location = this.urlToLocation(url, partialLocation.state);
              needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context2.next = 8;
                break;
              }

              reject = this.nativeRouter.testExecute(action, location);

              if (!reject) {
                _context2.next = 8;
                break;
              }

              throw reject;

            case 8:
              curPage = this.getCurrentPage();
              _context2.prev = 9;
              _context2.next = 12;
              return curPage.store.dispatch(testRouteChangeAction(location, action));

            case 12:
              _context2.next = 18;
              break;

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](9);

              if (nativeCaller) {
                _context2.next = 18;
                break;
              }

              throw _context2.t0;

            case 18:
              _context2.next = 20;
              return curPage.store.dispatch(beforeRouteChangeAction(location, action));

            case 20:
              curPage.saveTitle(this.getDocumentTitle());
              this.action = action;
              newStore = curPage.store.clone(refresh);
              curPageStack = this.windowStack.getCurrentItem();
              newRecord = new RouteRecord(location, curPageStack, newStore);

              if (target === 'window') {
                curPageStack.relaunch(newRecord);
              } else {
                curPageStack.replace(newRecord);
              }

              _context2.prev = 26;
              _context2.next = 29;
              return this.mountStore(curPage.store, newStore);

            case 29:
              _context2.next = 34;
              break;

            case 31:
              _context2.prev = 31;
              _context2.t1 = _context2["catch"](26);
              env.console.error(_context2.t1);

            case 34:
              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context2.next = 37;
                break;
              }

              _context2.next = 37;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 37:
              _context2.next = 39;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: curPage.store,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 39:
              newStore.dispatch(afterRouteChangeAction(location, action));

            case 40:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[9, 14], [26, 31]]);
    }));

    function _replace(_x5, _x6, _x7, _x8) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto5.push = function push(partialLocation, target, refresh, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto5._push = function () {
    var _push2 = _asyncToGenerator(regenerator.mark(function _callee3(partialLocation, target, refresh, nativeCaller) {
      var action, url, location, needToNotifyNativeRouter, reject, curPage, newStore, curPageStack, newRecord, newPageStack;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              action = 'push';
              url = this.computeUrl(partialLocation, action, target);
              location = this.urlToLocation(url, partialLocation.state);
              needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context3.next = 8;
                break;
              }

              reject = this.nativeRouter.testExecute(action, location);

              if (!reject) {
                _context3.next = 8;
                break;
              }

              throw reject;

            case 8:
              curPage = this.getCurrentPage();
              _context3.prev = 9;
              _context3.next = 12;
              return curPage.store.dispatch(testRouteChangeAction(location, action));

            case 12:
              _context3.next = 18;
              break;

            case 14:
              _context3.prev = 14;
              _context3.t0 = _context3["catch"](9);

              if (nativeCaller) {
                _context3.next = 18;
                break;
              }

              throw _context3.t0;

            case 18:
              _context3.next = 20;
              return curPage.store.dispatch(beforeRouteChangeAction(location, action));

            case 20:
              curPage.saveTitle(this.getDocumentTitle());
              this.action = action;
              newStore = curPage.store.clone(target === 'window' || refresh);
              curPageStack = this.windowStack.getCurrentItem();

              if (target === 'window') {
                newPageStack = new this.PageStackClass(this.windowStack, location, newStore);
                newRecord = newPageStack.getCurrentItem();
                this.windowStack.push(newPageStack);
              } else {
                newRecord = new RouteRecord(location, curPageStack, newStore);
                curPageStack.push(newRecord);
              }

              _context3.prev = 25;
              _context3.next = 28;
              return this.mountStore(curPage.store, newStore);

            case 28:
              _context3.next = 33;
              break;

            case 30:
              _context3.prev = 30;
              _context3.t1 = _context3["catch"](25);
              env.console.error(_context3.t1);

            case 33:
              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context3.next = 36;
                break;
              }

              _context3.next = 36;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 36:
              _context3.next = 38;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: curPage.store,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 38:
              newStore.dispatch(afterRouteChangeAction(location, action));

            case 39:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[9, 14], [25, 30]]);
    }));

    function _push(_x9, _x10, _x11, _x12) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto5.back = function back(stepOrKeyOrCallback, target, overflowRedirect, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (overflowRedirect === void 0) {
      overflowRedirect = '';
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    if (typeof stepOrKeyOrCallback === 'string') {
      stepOrKeyOrCallback = stepOrKeyOrCallback.trim();
    }

    if (stepOrKeyOrCallback === '') {
      this.nativeRouter.exit();
      return Promise.resolve();
    }

    if (!stepOrKeyOrCallback) {
      return this.replace(this.getCurrentPage().location, 'page');
    }

    return this.addTask(this._back.bind(this, stepOrKeyOrCallback, target, overflowRedirect, _nativeCaller));
  };

  _proto5._back = function () {
    var _back2 = _asyncToGenerator(regenerator.mark(function _callee4(stepOrKeyOrCallback, target, overflowRedirect, nativeCaller) {
      var action, stepOrKey, items, i, _this$windowStack$bac, record, overflow, index, location, title, needToNotifyNativeRouter, reject, curPage, historyStore;

      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              action = 'back';
              stepOrKey = '';

              if (typeof stepOrKeyOrCallback === 'function') {
                items = this.getHistory(target);
                i = items.findIndex(stepOrKeyOrCallback);

                if (i > -1) {
                  stepOrKey = items[i].key;
                }
              } else {
                stepOrKey = stepOrKeyOrCallback;
              }

              if (stepOrKey) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt("return", this.backError(stepOrKey, overflowRedirect));

            case 5:
              _this$windowStack$bac = this.windowStack.backTest(stepOrKey, target === 'window'), record = _this$windowStack$bac.record, overflow = _this$windowStack$bac.overflow, index = _this$windowStack$bac.index;

              if (!overflow) {
                _context4.next = 8;
                break;
              }

              return _context4.abrupt("return", this.backError(stepOrKey, overflowRedirect));

            case 8:
              if (!(!index[0] && !index[1])) {
                _context4.next = 10;
                break;
              }

              return _context4.abrupt("return");

            case 10:
              location = record.location;
              title = record.title;
              needToNotifyNativeRouter = Boolean(index[0] && this.needToNotifyNativeRouter(action, 'window')) || Boolean(index[1] && this.needToNotifyNativeRouter(action, 'page'));

              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context4.next = 17;
                break;
              }

              reject = this.nativeRouter.testExecute(action, location, index);

              if (!reject) {
                _context4.next = 17;
                break;
              }

              throw reject;

            case 17:
              curPage = this.getCurrentPage();
              _context4.prev = 18;
              _context4.next = 21;
              return curPage.store.dispatch(testRouteChangeAction(location, action));

            case 21:
              _context4.next = 27;
              break;

            case 23:
              _context4.prev = 23;
              _context4.t0 = _context4["catch"](18);

              if (nativeCaller) {
                _context4.next = 27;
                break;
              }

              throw _context4.t0;

            case 27:
              _context4.next = 29;
              return curPage.store.dispatch(beforeRouteChangeAction(location, action));

            case 29:
              curPage.saveTitle(this.getDocumentTitle());
              this.action = action;

              if (index[0]) {
                this.windowStack.back(index[0]);
              }

              if (index[1]) {
                this.windowStack.getCurrentItem().back(index[1]);
              }

              historyStore = this.getCurrentPage().store;
              _context4.prev = 34;
              _context4.next = 37;
              return this.mountStore(curPage.store, historyStore);

            case 37:
              _context4.next = 42;
              break;

            case 39:
              _context4.prev = 39;
              _context4.t1 = _context4["catch"](34);
              env.console.error(_context4.t1);

            case 42:
              if (!(!nativeCaller && needToNotifyNativeRouter)) {
                _context4.next = 45;
                break;
              }

              _context4.next = 45;
              return this.nativeRouter.execute(action, location, record.key, index);

            case 45:
              this.setDocumentHead(title);
              _context4.next = 48;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: curPage.store,
                newStore: historyStore,
                windowChanged: !!index[0]
              });

            case 48:
              historyStore.dispatch(afterRouteChangeAction(location, action));

            case 49:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this, [[18, 23], [34, 39]]);
    }));

    function _back(_x13, _x14, _x15, _x16) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto5.backError = function backError(stepOrKey, redirect) {
    var curStore = this.getCurrentPage().store;
    var backOverflow = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {
        stepOrKey: stepOrKey,
        redirect: redirect
      }
    };
    return curStore.dispatch(errorAction(backOverflow));
  };

  return Router;
}(ARouter);
var routerConfig = {
  QueryString: {
    parse: function parse(str) {
      return {};
    },
    stringify: function stringify() {
      return '';
    }
  },
  NativePathnameMapping: {
    in: function _in(pathname) {
      return pathname;
    },
    out: function out(pathname) {
      return pathname;
    }
  },
  NeedToNotifyNativeRouter: function NeedToNotifyNativeRouter() {
    return false;
  }
};

function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });
  return {
    moduleName: moduleName,
    ModelClass: ModelClass,
    components: components,
    data: data,
    state: {},
    actions: {}
  };
}
function moduleExists(moduleName) {
  return !!baseConfig.ModuleGetter[moduleName];
}
function getModule(moduleName) {
  var request = baseConfig.ModuleGetter[moduleName];

  if (!request) {
    return undefined;
  }

  if (moduleConfig.ModuleCaches[moduleName]) {
    return moduleConfig.ModuleCaches[moduleName];
  }

  var moduleOrPromise = request();

  if (isPromise(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      injectActions(new module.ModelClass(moduleName, null));
      moduleConfig.ModuleCaches[moduleName] = module;
      return module;
    }, function (reason) {
      moduleConfig.ModuleCaches[moduleName] = undefined;
      throw reason;
    });
    moduleConfig.ModuleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  injectActions(new moduleOrPromise.ModelClass(moduleName, null));
  moduleConfig.ModuleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
function getComponent(moduleName, componentName) {
  var key = [moduleName, componentName].join('.');

  if (moduleConfig.ComponentCaches[key]) {
    return moduleConfig.ComponentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if (!componentOrFun) {
      return undefined;
    }

    if (isEluxComponent(componentOrFun)) {
      moduleConfig.ComponentCaches[key] = componentOrFun;
      return componentOrFun;
    }

    var promiseComponent = componentOrFun().then(function (_ref2) {
      var component = _ref2.default;
      moduleConfig.ComponentCaches[key] = component;
      return component;
    }, function (reason) {
      moduleConfig.ComponentCaches[key] = undefined;
      throw reason;
    });
    moduleConfig.ComponentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  var moduleOrPromise = getModule(moduleName);

  if (!moduleOrPromise) {
    return undefined;
  }

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      var component = moduleCallback(module);

      if (component) {
        return component;
      }

      throw "Not found " + key;
    });
  }

  return moduleCallback(moduleOrPromise);
}
function getEntryComponent() {
  return getComponent(actionConfig.StageModuleName, baseConfig.StageViewName);
}
function getModuleApiMap(data) {
  if (!moduleConfig.ModuleApiMap) {
    if (data) {
      moduleConfig.ModuleApiMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + actionConfig.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + actionConfig.NSP + actionName;
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
      moduleConfig.ModuleApiMap = new Proxy({}, {
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
                  return moduleName + actionConfig.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + actionConfig.NSP + actionName,
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

  return moduleConfig.ModuleApiMap;
}
function injectModule(moduleOrName, moduleGetter) {
  if (typeof moduleOrName === 'string') {
    baseConfig.ModuleGetter[moduleOrName] = moduleGetter;
  } else {
    baseConfig.ModuleGetter[moduleOrName.moduleName] = function () {
      return moduleOrName;
    };
  }
}
function injectActions(model, hmr) {
  var moduleName = model.moduleName;
  var handlers = model;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(',').forEach(function (actionName) {
            actionName = actionName.trim();

            if (actionName) {
              actionName = actionName.replace(new RegExp("^this[" + actionConfig.NSP + "]"), "" + moduleName + actionConfig.NSP);
              var arr = actionName.split(actionConfig.NSP);

              if (arr[1]) {
                transformAction(actionName, handler, moduleName, handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap, hmr);
              } else {
                transformAction(moduleName + actionConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap, hmr);
              }
            }
          });
        }
      })();
    }
  }
}

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

baseConfig.GetModule = getModule;
var moduleConfig = {
  ModuleCaches: {},
  ComponentCaches: {},
  ModuleApiMap: null
};

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

var _class;
function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
function getApi() {
  var modules = getModuleApiMap();

  var GetComponent = function GetComponent(moduleName, componentName) {
    var result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  var GetData = function GetData(moduleName) {
    var result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(function (mod) {
        return mod.data;
      });
    } else {
      return Promise.resolve(result.data);
    }
  };

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
    GetClientRouter: function GetClientRouter() {
      if (env.isServer) {
        throw 'Cannot use GetClientRouter() in the server side, please use useRouter() instead';
      }

      return baseConfig.ClientRouter;
    },
    LoadComponent: facadeConfig.LoadComponent,
    GetComponent: GetComponent,
    GetData: GetData,
    Modules: modules,
    useRouter: facadeConfig.UseRouter,
    useStore: facadeConfig.UseStore
  };
}
var BaseModel = (_class = function () {
  function BaseModel(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = BaseModel.prototype;

  _proto.onBuild = function onBuild() {
    return;
  };

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.getPrevState = function getPrevState() {
    return this.store.router.prevState[this.moduleName];
  };

  _proto.getStoreState = function getStoreState(type) {
    if (type === 'previous') {
      return this.store.router.prevState;
    } else if (type === 'uncommitted') {
      return this.store.getUncommittedState();
    } else {
      return this.store.getState();
    }
  };

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto._initState = function _initState(state) {
    return state;
  };

  _proto._updateState = function _updateState(subject, state) {
    return mergeState(this.state, state);
  };

  _proto._loadingState = function _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  };

  _createClass(BaseModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }, {
    key: "router",
    get: function get() {
      return this.store.router;
    }
  }, {
    key: "actions",
    get: function get() {
      return moduleConfig.ModuleApiMap[this.moduleName].actions;
    }
  }]);

  return BaseModel;
}(), (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);
var facadeConfig = {};

export { BaseModel, BaseNativeRouter, ErrorCodes, Router, SingleDispatcher, SsrApp, Store, WebApp, actionConfig, baseConfig, deepClone, effect, env, errorAction, exportComponent, exportModule, exportView, getApi, getComponent, getEntryComponent, getModule, getModuleApiMap, injectModule, isPromise, isServer, loadingAction, locationToNativeLocation, _locationToUrl as locationToUrl, moduleExists, nativeLocationToLocation, _nativeUrlToUrl as nativeUrlToUrl, reducer, setProcessedError, toPromise, _urlToLocation as urlToLocation, urlToNativeUrl };
