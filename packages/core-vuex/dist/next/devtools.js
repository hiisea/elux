import { setupDevtoolsPlugin } from '@vue/devtools-api';
const LABEL_VUEX_BINDINGS = 'vuex bindings';
const MUTATIONS_LAYER_ID = 'vuex:mutations';
const INSPECTOR_ID = 'vuex';
const COLOR_LIME_500 = 0x84cc16;
export class DevTools {
  install(app) {
    if (process.env.NODE_ENV === 'development') {
      setupDevtoolsPlugin({
        id: 'org.vuejs.vuex',
        app,
        label: 'Vuex',
        homepage: 'https://next.vuex.vuejs.org/',
        logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
        packageName: 'vuex',
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      }, api => {
        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID,
          label: 'Vuex Mutations',
          color: COLOR_LIME_500
        });
        api.addInspector({
          id: INSPECTOR_ID,
          label: 'Vuex',
          icon: 'storage'
        });
      });
    }
  }

}