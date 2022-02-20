"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.DocumentHead = void 0;

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

var clientTimer = 0;
var recoverLock = false;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = _core.env.setTimeout(function () {
      clientTimer = 0;
      recoverLock = false;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        _base.reactComponentsConfig.setPageTitle(arr[1]);
      }
    }, 0);
  }
}

function recoverClientHead(eluxContext, documentHead) {
  if (!recoverLock) {
    recoverLock = true;
    setClientHead(eluxContext, documentHead);
  }
}

var Component = function Component(_ref) {
  var title = _ref.title,
      html = _ref.html;
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);

  if (!html) {
    html = eluxContext.documentHead || '<title>Elux</title>';
  }

  if (title) {
    html = html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
  }

  if (_core.env.isServer) {
    eluxContext.documentHead = html;
  }

  (0, _react.useEffect)(function () {
    var raw = eluxContext.documentHead;
    setClientHead(eluxContext, html);
    recoverLock = false;
    return function () {
      return recoverClientHead(eluxContext, raw);
    };
  }, [eluxContext, html]);
  return null;
};

var DocumentHead = _react.default.memo(Component);

exports.DocumentHead = DocumentHead;