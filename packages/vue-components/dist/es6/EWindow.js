import { getEntryComponent } from '@elux/core';
import { defineComponent, h, provide } from 'vue';
import { EluxStoreContextKey } from './base';
export const EWindow = defineComponent({
  name: 'EluxWindow',
  props: {
    store: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const AppView = getEntryComponent();
    const storeContext = {
      store: props.store
    };
    provide(EluxStoreContextKey, storeContext);
    return () => h(AppView, null);
  }

});