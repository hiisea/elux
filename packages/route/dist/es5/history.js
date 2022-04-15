import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
export var HistoryStack = function () {
  function HistoryStack(limit) {
    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  var _proto = HistoryStack.prototype;

  _proto.init = function init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.setActive();
  };

  _proto.onChanged = function onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.setInactive();
      this.currentRecord = this.records[0];
      this.currentRecord.setActive();
    }
  };

  _proto.getCurrentItem = function getCurrentItem() {
    return this.currentRecord;
  };

  _proto.getEarliestItem = function getEarliestItem() {
    return this.records[this.records.length - 1];
  };

  _proto.getItemAt = function getItemAt(n) {
    return this.records[n];
  };

  _proto.getLength = function getLength() {
    return this.records.length;
  };

  _proto.push = function push(item) {
    var records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      var delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  };

  _proto.replace = function replace(item) {
    var records = this.records;
    var delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  };

  _proto.relaunch = function relaunch(item) {
    var delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(function (delItem) {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  };

  _proto.back = function back(delta) {
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
    this.onChanged();
  };

  return HistoryStack;
}();
export var RouteRecord = function () {
  function RouteRecord(location, pageStack) {
    this.key = void 0;
    this.location = location;
    this.pageStack = pageStack;
    this.key = [pageStack.key, pageStack.id++].join('_');
  }

  var _proto2 = RouteRecord.prototype;

  _proto2.setActive = function setActive() {
    return;
  };

  _proto2.setInactive = function setInactive() {
    return;
  };

  _proto2.destroy = function destroy() {
    return;
  };

  return RouteRecord;
}();
export var PageStack = function (_HistoryStack) {
  _inheritsLoose(PageStack, _HistoryStack);

  function PageStack(windowStack, location, store) {
    var _this;

    _this = _HistoryStack.call(this, 20) || this;
    _this.id = 0;
    _this.key = void 0;
    _this._store = void 0;
    _this.windowStack = windowStack;
    _this._store = store;
    _this.key = '' + windowStack.id++;

    _this.init(new RouteRecord(location, _assertThisInitialized(_this)));

    return _this;
  }

  var _proto3 = PageStack.prototype;

  _proto3.replaceStore = function replaceStore(store) {
    if (this._store !== store) {
      this._store.destroy();

      this._store = store;
      store.setActive();
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    for (var i = 0, k = this.records.length; i < k; i++) {
      var item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  };

  _proto3.setActive = function setActive() {
    this.store.setActive();
  };

  _proto3.setInactive = function setInactive() {
    this.store.setInactive();
  };

  _proto3.destroy = function destroy() {
    this.store.destroy();
  };

  _createClass(PageStack, [{
    key: "store",
    get: function get() {
      return this._store;
    }
  }]);

  return PageStack;
}(HistoryStack);
export var WindowStack = function (_HistoryStack2) {
  _inheritsLoose(WindowStack, _HistoryStack2);

  function WindowStack(location, store) {
    var _this2;

    _this2 = _HistoryStack2.call(this, 10) || this;
    _this2.id = 0;

    _this2.init(new PageStack(_assertThisInitialized(_this2), location, store));

    return _this2;
  }

  var _proto4 = WindowStack.prototype;

  _proto4.getCurrentWindowPage = function getCurrentWindowPage() {
    var item = this.getCurrentItem();
    var store = item.store;
    var record = item.getCurrentItem();
    var url = record.location.url;
    return {
      url: url,
      store: store
    };
  };

  _proto4.getWindowPages = function getWindowPages() {
    return this.records.map(function (item) {
      var store = item.store;
      var record = item.getCurrentItem();
      var url = record.location.url;
      return {
        url: url,
        store: store
      };
    });
  };

  _proto4.countBack = function countBack(delta) {
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

  _proto4.testBack = function testBack(stepOrKey, rootOnly) {
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
        index: [this.records.length - 1, _pageStack2.getLength() - 1]
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
        index: [this.records.length - 1, _pageStack3.getLength() - 1]
      };
    }
  };

  _proto4.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('_');

    for (var i = 0, k = this.records.length; i < k; i++) {
      var _pageStack4 = this.records[i];

      if (_pageStack4.key === arr[0]) {
        var item = _pageStack4.findRecordByKey(key);

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