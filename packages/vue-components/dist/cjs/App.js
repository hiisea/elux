"use strict";

exports.__esModule = true;
exports.default = void 0;

var _core = require("@elux/core");

var _server = require("@elux/vue-components/server");

var _base = require("./base");

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app, store) {
    app.provide(_base.EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount("#" + id);
  },
  toString: function toString(id, eluxContext, app, store) {
    app.provide(_base.EluxContextKey, eluxContext);
    return (0, _server.renderToString)(app);
  }
};
var _default = AppRender;
exports.default = _default;