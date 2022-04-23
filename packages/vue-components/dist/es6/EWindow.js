import { defineComponent, h, provide } from 'vue';
import { getEntryComponent } from '@elux/core';
import { EluxStoreContextKey } from './base';
export const EWindow = defineComponent({
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