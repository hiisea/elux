"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.EluxContextComponent = void 0;
exports.UseRouter = UseRouter;

var _react = _interopRequireWildcard(require("react"));

var EluxContextComponent = _react.default.createContext({
  documentHead: '',
  router: null
});

exports.EluxContextComponent = EluxContextComponent;

function UseRouter() {
  var eluxContext = (0, _react.useContext)(EluxContextComponent);
  return eluxContext.router;
}