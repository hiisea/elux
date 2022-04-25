/* eslint-disable vue/one-component-per-file */
import {defineComponent, h, PropType, provide} from 'vue';

import {EluxStoreContext, getEntryComponent, IStore} from '@elux/core';

import {EluxStoreContextKey} from './base';

export const EWindow: Elux.Component<{store: IStore}> = defineComponent({
  props: {
    store: {
      type: Object as PropType<IStore>,
      required: true,
    },
  },
  setup(props) {
    const AppView: Elux.Component = getEntryComponent() as any;
    const storeContext: EluxStoreContext = {store: props.store};
    provide(EluxStoreContextKey, storeContext);
    return () => h(AppView, null);
  },
}) as any;
