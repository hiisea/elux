import { getEntryComponent } from '@elux/core';
import { defineComponent, h, provide, shallowReactive, watch } from 'vue';
import { EluxStoreContextKey } from './base';
export var EWindow = defineComponent({
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