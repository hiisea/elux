import { reactive, computed } from 'vue';
import { Store } from './store';
export function storeCreator(storeOptions) {
  const {
    initState = {}
  } = storeOptions;
  const state = reactive(initState);
  return new Store(state, {
    storeCreator,
    storeOptions
  });
}
export function createStore(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}
export function refStore(store, maps) {
  const state = store.getState();
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = computed(() => maps[prop](state));
    return data;
  }, {});
}
export function getRefsValue(refs, keys) {
  return (keys || Object.keys(refs)).reduce((data, key) => {
    data[key] = refs[key].value;
    return data;
  }, {});
}
export function mapState(storeProperty, maps) {
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = function () {
      const store = this[storeProperty];
      const state = store.getState();
      return maps[prop].call(this, state);
    };

    return data;
  }, {});
}