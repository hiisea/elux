"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.WindowStack = exports.RouteRecord = exports.PageStack = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var _basic = require("./basic");

var HistoryStack = function () {
  function HistoryStack(limit) {
    (0, _defineProperty2.default)(this, "records", []);
    this.limit = limit;
  }

  var _proto = HistoryStack.prototype;

  _proto.startup = function startup(record) {
    var oItem = this.records[0];
    this.records = [record];
    this.setActive(oItem);
  };

  _proto.getCurrentItem = function getCurrentItem() {
    return this.records[0];
  };

  _proto.getEarliestItem = function getEarliestItem() {
    return this.records[this.records.length - 1];
  };

  _proto.getItemAt = function getItemAt(n) {
    return this.records[n];
  };

  _proto.getItems = function getItems() {
    return [].concat(this.records);
  };

  _proto.getLength = function getLength() {
    return this.records.length;
  };

  _proto._push = function _push(item) {
    var records = this.records;
    var oItem = records[0];
    records.unshift(item);
    var delItem = records.splice(this.limit)[0];

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(oItem);
  };

  _proto._replace = function _replace(item) {
    var records = this.records;
    var delItem = records[0];
    records[0] = item;

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(delItem);
  };

  _proto._relaunch = function _relaunch(item) {
    var delList = this.records;
    var oItem = delList[0];
    this.records = [item];
    delList.forEach(function (delItem) {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  };

  _proto.back = function back(delta) {
    var oItem = this.records[0];
    var delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      var last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(function (delItem) {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  };

  _proto.setActive = function setActive(oItem) {
    var _this$records$;

    var oStore = oItem == null ? void 0 : oItem.store;
    var store = (_this$records$ = this.records[0]) == null ? void 0 : _this$records$.store;

    if (store === oStore) {
      store == null ? void 0 : store.setActive(true);
    } else {
      oStore == null ? void 0 : oStore.setActive(false);
      store == null ? void 0 : store.setActive(true);
    }
  };

  return HistoryStack;
}();

var RouteRecord = function RouteRecord(location, pageStack) {
  (0, _defineProperty2.default)(this, "destroy", void 0);
  (0, _defineProperty2.default)(this, "key", void 0);
  (0, _defineProperty2.default)(this, "recordKey", void 0);
  this.location = location;
  this.pageStack = pageStack;
  this.recordKey = _core.env.isServer ? '0' : ++RouteRecord.id + '';
  this.key = [pageStack.stackkey, this.recordKey].join('-');
};

exports.RouteRecord = RouteRecord;
(0, _defineProperty2.default)(RouteRecord, "id", 0);

var PageStack = function (_HistoryStack) {
  (0, _inheritsLoose2.default)(PageStack, _HistoryStack);

  function PageStack(windowStack, store) {
    var _this;

    _this = _HistoryStack.call(this, 20) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "stackkey", void 0);
    _this.windowStack = windowStack;
    _this.store = store;
    _this.stackkey = _core.env.isServer ? '0' : ++PageStack.id + '';
    return _this;
  }

  var _proto2 = PageStack.prototype;

  _proto2.push = function push(location) {
    var newRecord = new RouteRecord(location, this);

    this._push(newRecord);

    return newRecord;
  };

  _proto2.replace = function replace(location) {
    var newRecord = new RouteRecord(location, this);

    this._replace(newRecord);

    return newRecord;
  };

  _proto2.relaunch = function relaunch(location) {
    var newRecord = new RouteRecord(location, this);

    this._relaunch(newRecord);

    return newRecord;
  };

  _proto2.findRecordByKey = function findRecordByKey(recordKey) {
    for (var i = 0, k = this.records.length; i < k; i++) {
      var item = this.records[i];

      if (item.recordKey === recordKey) {
        return [item, i];
      }
    }

    return undefined;
  };

  _proto2.destroy = function destroy() {
    this.store.destroy();
  };

  return PageStack;
}(HistoryStack);

exports.PageStack = PageStack;
(0, _defineProperty2.default)(PageStack, "id", 0);

var WindowStack = function (_HistoryStack2) {
  (0, _inheritsLoose2.default)(WindowStack, _HistoryStack2);

  function WindowStack() {
    return _HistoryStack2.call(this, _basic.routeConfig.maxHistory) || this;
  }

  var _proto3 = WindowStack.prototype;

  _proto3.getCurrentPages = function getCurrentPages() {
    return this.records.map(function (item) {
      var store = item.store;
      var record = item.getCurrentItem();
      var pagename = record.location.getPagename();
      return {
        pagename: pagename,
        store: store,
        pageComponent: _basic.routeMeta.pageComponents[pagename]
      };
    });
  };

  _proto3.push = function push(location) {
    var curHistory = this.getCurrentItem();
    var routeState = {
      pagename: location.getPagename(),
      params: location.getParams(),
      action: _core.RouteHistoryAction.RELAUNCH,
      key: ''
    };
    var store = (0, _core.forkStore)(curHistory.store, routeState);
    var newHistory = new PageStack(this, store);
    var newRecord = new RouteRecord(location, newHistory);
    newHistory.startup(newRecord);

    this._push(newHistory);

    return newRecord;
  };

  _proto3.replace = function replace(location) {
    var curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  };

  _proto3.relaunch = function relaunch(location) {
    var curHistory = this.getCurrentItem();
    var newRecord = curHistory.relaunch(location);

    this._relaunch(curHistory);

    return newRecord;
  };

  _proto3.countBack = function countBack(delta) {
    var historyStacks = this.records;
    var backSteps = [0, 0];

    for (var i = 0, k = historyStacks.length; i < k; i++) {
      var _pageStack = historyStacks[i];

      var recordNum = _pageStack.getLength();

      delta = delta - recordNum;

      if (delta > 0) {
        backSteps[0]++;
      } else if (delta === 0) {
        backSteps[0]++;
        break;
      } else {
        backSteps[1] = recordNum + delta;
        break;
      }
    }

    return backSteps;
  };

  _proto3.testBack = function testBack(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    var delta = stepOrKey;

    if (delta === 0) {
      var record = this.getCurrentItem().getCurrentItem();
      return {
        record: record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        var _record = this.getEarliestItem().getCurrentItem();

        return {
          record: _record,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        var _record2 = this.getItemAt(delta).getCurrentItem();

        return {
          record: _record2,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      var _pageStack2 = this.getEarliestItem();

      var _record3 = _pageStack2.getEarliestItem();

      return {
        record: _record3,
        overflow: false,
        index: [this.records.length - 1, _pageStack2.records.length - 1]
      };
    }

    var _this$countBack = this.countBack(delta),
        rootDelta = _this$countBack[0],
        recordDelta = _this$countBack[1];

    if (rootDelta < this.records.length) {
      var _record4 = this.getItemAt(rootDelta).getItemAt(recordDelta);

      return {
        record: _record4,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      var _pageStack3 = this.getEarliestItem();

      var _record5 = _pageStack3.getEarliestItem();

      return {
        record: _record5,
        overflow: true,
        index: [this.records.length - 1, _pageStack3.records.length - 1]
      };
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('-');

    for (var i = 0, k = this.records.length; i < k; i++) {
      var _pageStack4 = this.records[i];

      if (_pageStack4.stackkey === arr[0]) {
        var item = _pageStack4.findRecordByKey(arr[1]);

        if (item) {
          return {
            record: item[0],
            index: [i, item[1]],
            overflow: false
          };
        }
      }
    }

    return {
      record: this.getCurrentItem().getCurrentItem(),
      index: [0, 0],
      overflow: true
    };
  };

  return WindowStack;
}(HistoryStack);

exports.WindowStack = WindowStack;