/// <reference path="../runtime/runtime.d.ts" />
import {env} from '@elux/core';

declare const btoa: any;
declare const atob: any;
declare const Buffer: any;

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
