"use strict";

exports.__esModule = true;
exports.DevTools = void 0;

var _devtoolsApi = require("@vue/devtools-api");

var LABEL_VUEX_BINDINGS = 'vuex bindings';
var MUTATIONS_LAYER_ID = 'vuex:mutations';
var INSPECTOR_ID = 'vuex';
var COLOR_LIME_500 = 0x84cc16;

var DevTools = function () {
  function DevTools() {}

  var _proto = DevTools.prototype;

  _proto.install = function install(app) {
    if (process.env.NODE_ENV === 'development') {
      (0, _devtoolsApi.setupDevtoolsPlugin)({
        id: 'org.vuejs.vuex',
        app: app,
        label: 'Vuex',
        homepage: 'https://next.vuex.vuejs.org/',
        logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
        packageName: 'vuex',
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      }, function (api) {
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
  };

  return DevTools;
}();

exports.DevTools = DevTools;