"use strict";

var _core = require("@elux/core");

_core.env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

_core.env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};