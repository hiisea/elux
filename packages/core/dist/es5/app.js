import { coreConfig } from './basic';
import env from './env';
export function buildApp(ins, router) {
  var store = router.getCurrentPage().store;
  var ssrData = env[coreConfig.SSRDataKey];
  var AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render: function render(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$id = _ref.id,
          id = _ref$id === void 0 ? 'root' : _ref$id;

      return router.init(ssrData || {}).then(function () {
        AppRender.toDocument(id, {
          router: router,
          documentHead: ''
        }, !!ssrData, ins, store);
      });
    }
  });
}
export function buildProvider(ins, router) {
  var store = router.getCurrentPage().store;
  var AppRender = coreConfig.AppRender;
  router.init({});
  return AppRender.toProvider({
    router: router,
    documentHead: ''
  }, ins, store);
}
export function buildSSR(ins, router) {
  var store = router.getCurrentPage().store;
  var AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render: function render(_temp2) {
      var _ref2 = _temp2 === void 0 ? {} : _temp2,
          _ref2$id = _ref2.id,
          id = _ref2$id === void 0 ? 'root' : _ref2$id;

      return router.init({}).then(function () {
        store.destroy();
        var eluxContext = {
          router: router,
          documentHead: ''
        };
        return AppRender.toString(id, eluxContext, ins, store).then(function (html) {
          var SSRTPL = coreConfig.SSRTPL,
              SSRDataKey = coreConfig.SSRDataKey;
          var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

          if (match) {
            var state = store.getState();
            return SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + SSRDataKey + " = " + JSON.stringify(state) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
          }

          return html;
        });
      });
    }
  });
}