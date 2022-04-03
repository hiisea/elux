"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Switch = exports.Link = exports.Else = exports.DocumentHead = void 0;

var _core = require("@elux/core");

var _base = require("./base");

var _LoadComponent = require("./LoadComponent");

var _App = _interopRequireDefault(require("./App"));

var _DocumentHead = require("./DocumentHead");

exports.DocumentHead = _DocumentHead.DocumentHead;

var _Else = require("./Else");

exports.Else = _Else.Else;

var _Switch = require("./Switch");

exports.Switch = _Switch.Switch;

var _Link = require("./Link");

exports.Link = _Link.Link;
(0, _core.setCoreConfig)({
  UseRouter: _base.UseRouter,
  AppRender: _App.default,
  LoadComponent: _LoadComponent.LoadComponent,
  LoadComponentOnError: _LoadComponent.LoadComponentOnError,
  LoadComponentOnLoading: _LoadComponent.LoadComponentOnLoading
});