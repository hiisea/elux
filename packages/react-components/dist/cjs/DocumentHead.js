"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = _core.env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        _base.reactComponentsConfig.setPageTitle(arr[1]);
      }
    }, 0);
  }
}

var Component = function Component(_ref) {
  var _ref$title = _ref.title,
      title = _ref$title === void 0 ? '' : _ref$title,
      _ref$html = _ref.html,
      html = _ref$html === void 0 ? '' : _ref$html;

  if (!html) {
    html = "<title>" + title + "</title>";
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
  }

  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);

  if (_core.env.isServer) {
    eluxContext.documentHead = html;
  }

  (0, _react.useEffect)(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    return function () {
      return setClientHead(eluxContext, raw);
    };
  }, [eluxContext, html]);
  return null;
};

var _default = _react.default.memo(Component);

exports.default = _default;