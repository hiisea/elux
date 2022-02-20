"use strict";

exports.__esModule = true;
exports.Switch = void 0;

var _vue = require("vue");

var Switch = function Switch(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
    if (item.type !== _vue.Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return (0, _vue.h)(_vue.Fragment, null, [arr[0]]);
  }

  return (0, _vue.h)(_vue.Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};

exports.Switch = Switch;