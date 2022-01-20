import {App} from 'vue';
import {setupDevtoolsPlugin} from '@vue/devtools-api';

const LABEL_VUEX_BINDINGS = 'vuex bindings';
const MUTATIONS_LAYER_ID = 'vuex:mutations';
const INSPECTOR_ID = 'vuex';
const COLOR_LIME_500 = 0x84cc16;

//const actionId = 0;

export class DevTools {
  install(app: App): void {
    if (process.env.NODE_ENV === 'development') {
      setupDevtoolsPlugin(
        {
          id: 'org.vuejs.vuex',
          app,
          label: 'Vuex',
          homepage: 'https://next.vuex.vuejs.org/',
          logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
          packageName: 'vuex',
          componentStateTypes: [LABEL_VUEX_BINDINGS],
        },
        (api) => {
          api.addTimelineLayer({
            id: MUTATIONS_LAYER_ID,
            label: 'Vuex Mutations',
            color: COLOR_LIME_500,
          });

          api.addInspector({
            id: INSPECTOR_ID,
            label: 'Vuex',
            icon: 'storage',
            //treeFilterPlaceholder: 'Filter stores...',
          });

          // api.on.getInspectorTree((payload) => {
          //   if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          //     if (payload.filter) {
          //       const nodes = [];
          //       getInspectorTree(nodes, store._modules.root, payload.filter, '');
          //       payload.rootNodes = nodes;
          //     } else {
          //       payload.rootNodes = [formatStoreForInspectorTree(store._modules.root, '')];
          //     }
          //   }
          // });

          // api.on.getInspectorState((payload) => {
          //   if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          //     const modulePath = payload.nodeId;
          //     makeLocalGetters(store, modulePath);
          //     payload.state = formatStoreForInspectorState(
          //       getStoreModule(store._modules, modulePath),
          //       modulePath === 'root' ? store.getters : store._makeLocalGettersCache,
          //       modulePath
          //     );
          //   }
          // });

          // api.on.editInspectorState((payload) => {
          //   if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          //     const modulePath = payload.nodeId;
          //     let path = payload.path;
          //     if (modulePath !== 'root') {
          //       path = [...modulePath.split('/').filter(Boolean), ...path];
          //     }
          //     store._withCommit(() => {
          //       payload.set(store._state.data, path, payload.state.value);
          //     });
          //   }
          // });

          // store.subscribe((mutation, state) => {
          //   const data = {};

          //   if (mutation.payload) {
          //     data.payload = mutation.payload;
          //   }

          //   data.state = state;

          //   api.notifyComponentUpdate();
          //   api.sendInspectorTree(INSPECTOR_ID);
          //   api.sendInspectorState(INSPECTOR_ID);

          //   api.addTimelineEvent({
          //     layerId: MUTATIONS_LAYER_ID,
          //     event: {
          //       time: Date.now(),
          //       title: mutation.type,
          //       data,
          //     },
          //   });
          // });

          // store.subscribeAction({
          //   before: (action, state) => {
          //     const data = {};
          //     if (action.payload) {
          //       data.payload = action.payload;
          //     }
          //     action._id = actionId++;
          //     action._time = Date.now();
          //     data.state = state;

          //     api.addTimelineEvent({
          //       layerId: ACTIONS_LAYER_ID,
          //       event: {
          //         time: action._time,
          //         title: action.type,
          //         groupId: action._id,
          //         subtitle: 'start',
          //         data,
          //       },
          //     });
          //   },
          //   after: (action, state) => {
          //     const data = {};
          //     const duration = Date.now() - action._time;
          //     data.duration = {
          //       _custom: {
          //         type: 'duration',
          //         display: `${duration}ms`,
          //         tooltip: 'Action duration',
          //         value: duration,
          //       },
          //     };
          //     if (action.payload) {
          //       data.payload = action.payload;
          //     }
          //     data.state = state;

          //     api.addTimelineEvent({
          //       layerId: ACTIONS_LAYER_ID,
          //       event: {
          //         time: Date.now(),
          //         title: action.type,
          //         groupId: action._id,
          //         subtitle: 'end',
          //         data,
          //       },
          //     });
          //   },
          // });
        }
      );
    }
  }
}
