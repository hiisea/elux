"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _sington = require("../sington");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var clientTimer = 0;

function setClientHead(_ref) {
  var documentHead = _ref.documentHead;

  if (!clientTimer) {
    clientTimer = _core.env.setTimeout(function () {
      clientTimer = 0;
      var arr = documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        _core.env.document.title = arr[1];
      }
    }, 300);
  }
}

var Component = function Component(_ref2) {
  var children = _ref2.children;
  var eluxContext = (0, _react.useContext)(_sington.EluxContext);
  eluxContext.documentHead = children;

  if (!(0, _core.isServer)()) {
    setClientHead(eluxContext);
  }

  return null;
};

var _default = _react.default.memo(Component);

exports.default = _default;