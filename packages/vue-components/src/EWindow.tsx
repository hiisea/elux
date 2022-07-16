/* eslint-disable vue/one-component-per-file */
import {EluxStoreContext, getEntryComponent, IStore, VStore} from '@elux/core';
import {defineComponent, h, provide, shallowReactive, watch} from 'vue';
import {EluxStoreContextKey} from './base';

export const EWindow: Elux.Component<{store: IStore}> = defineComponent({
  name: 'EluxWindow',
  // eslint-disable-next-line vue/require-prop-types
  props: ['store'],
  setup(props: {store: IStore}) {
    const AppView: Elux.Component = getEntryComponent() as any;
    // eslint-disable-next-line vue/no-setup-props-destructure
    const store = props.store;
    const {uid, sid, state, dispatch, mount} = store;
    const storeRef: VStore = shallowReactive({uid, sid, state, dispatch: dispatch.bind(store), mount: mount.bind(store)});
    const storeContext: EluxStoreContext = {store: storeRef};
    provide(EluxStoreContextKey, storeContext);
    watch(
      () => props.store,
      (store) => {
        const {uid, sid, state, dispatch} = store;
        Object.assign(storeRef, {uid, sid, state, dispatch: dispatch.bind(store), mount: mount.bind(store)});
      }
    );
    return () => h(AppView, null);
  },
}) as any;
