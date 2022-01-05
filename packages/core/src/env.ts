/// <reference path="../runtime/runtime.d.ts" />
declare const window: any;
declare const global: any;
declare const module: any;
declare const self: any;
declare const btoa: any;
declare const atob: any;
declare const Buffer: any;

let root: any;
if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = new Function('return this')();
}

/**
 * @internal
 */
const env: EluxRuntime.ENV = root;

env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

env.encodeBas64 = function (str: string) {
  if (!str) {
    return '';
  }
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};
env.decodeBas64 = function (str: string) {
  if (!str) {
    return '';
  }
  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

export default env;
