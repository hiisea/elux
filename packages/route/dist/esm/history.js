import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env, forkStore } from '@elux/core';
import { routeMeta } from './basic';

var RouteStack = function () {
  function RouteStack(limit) {
    _defineProperty(this, "records", []);

    this.limit = limit;
  }

  var _proto = RouteStack.prototype;

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

  return RouteStack;
}();

export var HistoryRecord = function HistoryRecord(location, historyStack) {
  _defineProperty(this, "destroy", void 0);

  _defineProperty(this, "key", void 0);

  _defineProperty(this, "recordKey", void 0);

  this.location = location;
  this.historyStack = historyStack;
  this.recordKey = env.isServer ? '0' : ++HistoryRecord.id + '';
  this.key = [historyStack.stackkey, this.recordKey].join('-');
};

_defineProperty(HistoryRecord, "id", 0);

export var HistoryStack = function (_RouteStack) {
  _inheritsLoose(HistoryStack, _RouteStack);

  function HistoryStack(rootStack, store) {
    var _this;

    _this = _RouteStack.call(this, 20) || this;

    _defineProperty(_assertThisInitialized(_this), "stackkey", void 0);

    _this.rootStack = rootStack;
    _this.store = store;
    _this.stackkey = env.isServer ? '0' : ++HistoryStack.id + '';
    return _this;
  }

  var _proto2 = HistoryStack.prototype;

  _proto2.push = function push(location) {
    var newRecord = new HistoryRecord(location, this);

    this._push(newRecord);

    return newRecord;
  };

  _proto2.replace = function replace(location) {
    var newRecord = new HistoryRecord(location, this);

    this._replace(newRecord);

    return newRecord;
  };

  _proto2.relaunch = function relaunch(location) {
    var newRecord = new HistoryRecord(location, this);

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

  return HistoryStack;
}(RouteStack);

_defineProperty(HistoryStack, "id", 0);

export var RootStack = function (_RouteStack2) {
  _inheritsLoose(RootStack, _RouteStack2);

  function RootStack() {
    return _RouteStack2.call(this, 10) || this;
  }

  var _proto3 = RootStack.prototype;

  _proto3.getCurrentPages = function getCurrentPages() {
    return this.records.map(function (item) {
      var store = item.store;
      var record = item.getCurrentItem();
      var pagename = record.location.getPagename();
      return {
        pagename: pagename,
        store: store,
        pageData: routeMeta.pageDatas[pagename]
      };
    });
  };

  _proto3.push = function push(location) {
    var curHistory = this.getCurrentItem();
    var routeState = {
      pagename: location.getPagename(),
      params: location.getParams(),
      action: 'RELAUNCH',
      key: ''
    };
    var store = forkStore(curHistory.store, routeState);
    var newHistory = new HistoryStack(this, store);
    var newRecord = new HistoryRecord(location, newHistory);
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
      var _historyStack = historyStacks[i];

      var recordNum = _historyStack.getLength();

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
      var _historyStack2 = this.getEarliestItem();

      var _record3 = _historyStack2.getEarliestItem();

      return {
        record: _record3,
        overflow: false,
        index: [this.records.length - 1, _historyStack2.records.length - 1]
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
      var _historyStack3 = this.getEarliestItem();

      var _record5 = _historyStack3.getEarliestItem();

      return {
        record: _record5,
        overflow: true,
        index: [this.records.length - 1, _historyStack3.records.length - 1]
      };
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('-');

    for (var i = 0, k = this.records.length; i < k; i++) {
      var _historyStack4 = this.records[i];

      if (_historyStack4.stackkey === arr[0]) {
        var item = _historyStack4.findRecordByKey(arr[1]);

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

  return RootStack;
}(RouteStack);