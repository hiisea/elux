import { getEntryComponent } from '@elux/core';
import { defineComponent, h, provide, shallowReactive, watch } from 'vue';
import { EluxStoreContextKey } from './base';
export const EWindow = defineComponent({
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