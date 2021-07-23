"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.renderToDocument = exports.renderToString = exports.setRootViewOptions = exports.setLoadComponentOptions = exports.loadComponent = exports.Link = exports.Switch = exports.Else = exports.DocumentHead = void 0;

var _DocumentHead = _interopRequireDefault(require("./DocumentHead"));

exports.DocumentHead = _DocumentHead.default;

var _Else = _interopRequireDefault(require("./Else"));

exports.Else = _Else.default;

var _Switch = _interopRequireDefault(require("./Switch"));

exports.Switch = _Switch.default;

var _Link = _interopRequireDefault(require("./Link"));

exports.Link = _Link.default;

var _loadComponent = require("./loadComponent");

exports.loadComponent = _loadComponent.loadComponent;
exports.setLoadComponentOptions = _loadComponent.setLoadComponentOptions;

var _rootView = require("./rootView");

exports.setRootViewOptions = _rootView.setRootViewOptions;
exports.renderToString = _rootView.renderToString;
exports.renderToDocument = _rootView.renderToDocument;