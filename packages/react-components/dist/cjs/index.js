"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.reactComponentsConfig = exports.setReactComponentsConfig = exports.useRouter = exports.Router = exports.Page = exports.loadComponent = exports.Link = exports.Switch = exports.Else = exports.DocumentHead = void 0;

var _DocumentHead = _interopRequireDefault(require("./DocumentHead"));

exports.DocumentHead = _DocumentHead.default;

var _Else = _interopRequireDefault(require("./Else"));

exports.Else = _Else.default;

var _Switch = _interopRequireDefault(require("./Switch"));

exports.Switch = _Switch.default;

var _Link = _interopRequireDefault(require("./Link"));

exports.Link = _Link.default;

var _Router = require("./Router");

exports.Page = _Router.Page;
exports.Router = _Router.Router;
exports.useRouter = _Router.useRouter;

var _loadComponent = _interopRequireDefault(require("./loadComponent"));

exports.loadComponent = _loadComponent.default;

var _base = require("./base");

exports.setReactComponentsConfig = _base.setReactComponentsConfig;
exports.reactComponentsConfig = _base.reactComponentsConfig;