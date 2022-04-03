"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Switch = exports.RouterComponent = exports.Link = exports.Else = exports.DocumentHead = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var _LoadComponent = require("./LoadComponent");

var _App = _interopRequireDefault(require("./App"));

var _Router = require("./Router");

exports.RouterComponent = _Router.RouterComponent;

var _DocumentHead = require("./DocumentHead");

exports.DocumentHead = _DocumentHead.DocumentHead;

var _Switch = require("./Switch");

exports.Switch = _Switch.Switch;

var _Else = require("./Else");

exports.Else = _Else.Else;

var _Link = require("./Link");

exports.Link = _Link.Link;
(0, _core.setCoreConfig)({
  MutableData: true,
  StoreInitState: function StoreInitState() {
    return (0, _vue.reactive)({});
  },
  UseStore: _base.UseStore,
  UseRouter: _base.UseRouter,
  AppRender: _App.default,
  LoadComponent: _LoadComponent.LoadComponent,
  LoadComponentOnError: _LoadComponent.LoadComponentOnError,
  LoadComponentOnLoading: _LoadComponent.LoadComponentOnLoading
});