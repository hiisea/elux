/// <reference path="../env/global.d.ts" />

declare const window: any;
declare const global: any;
declare const module: any;
declare const self: any;

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
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  root = Function('return this')();
}

export const env: EluxCore.ENV = root;

env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
