"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.vueComponentsConfig = exports.setVueComponentsConfig = exports.loadComponent = exports.Link = exports.DocumentHead = void 0;

var _DocumentHead = _interopRequireDefault(require("./DocumentHead"));

exports.DocumentHead = _DocumentHead.default;

var _Link = _interopRequireDefault(require("./Link"));

exports.Link = _Link.default;

var _loadComponent = _interopRequireDefault(require("./loadComponent"));

exports.loadComponent = _loadComponent.default;

var _base = require("./base");

exports.setVueComponentsConfig = _base.setVueComponentsConfig;
exports.vueComponentsConfig = _base.vueComponentsConfig;