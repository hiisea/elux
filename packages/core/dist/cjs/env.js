"use strict";

exports.__esModule = true;
exports.env = void 0;
var root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var env = root;
exports.env = env;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;