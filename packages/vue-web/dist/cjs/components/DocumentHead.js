"use strict";

exports.__esModule = true;
exports.default = _default;

var _core = require("@elux/core");

var _vue = require("vue");

var _sington = require("../sington");

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

function _default(_ref2) {
  var html = _ref2.html;
  var eluxContext = (0, _vue.inject)(_sington.EluxContextKey, {
    documentHead: ''
  });
  eluxContext.documentHead = html;

  if (!(0, _core.isServer)()) {
    setClientHead(eluxContext);
  }

  return null;
}