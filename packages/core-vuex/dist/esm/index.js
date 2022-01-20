import { reactive, computed } from 'vue';
import { Store } from './store';
export function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta;
  var state = reactive(initState);
  return new Store(state, {
    storeCreator: storeCreator,
    storeOptions: storeOptions
  });
}
export function createStore(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}
export function refStore(store, maps) {
  var state = store.getState();
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = computed(function () {
      return maps[prop](state);
    });
    return data;
  }, {});
}
export function getRefsValue(refs, keys) {
  return (keys || Object.keys(refs)).reduce(function (data, key) {
    data[key] = refs[key].value;
    return data;
  }, {});
}
export function mapState(storeProperty, maps) {
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = function () {
      var store = this[storeProperty];
      var state = store.getState();
      return maps[prop].call(this, state);
    };

    return data;
  }, {});
}