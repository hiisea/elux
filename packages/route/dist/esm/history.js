import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { forkStore } from '@elux/core';
import { routeConfig, routeMeta } from './basic';
export var HistoryRecord = function HistoryRecord(location, key, history, store) {
  _defineProperty(this, "pagename", void 0);

  _defineProperty(this, "params", void 0);

  _defineProperty(this, "sub", void 0);

  this.key = key;
  this.history = history;
  this.store = store;
  var pagename = location.pagename,
      params = location.params;
  this.pagename = pagename;
  this.params = params;
  this.sub = new History(history);
  this.sub.startup(this);
};
export var History = function () {
  function History(parent) {
    _defineProperty(this, "records", []);

    this.parent = parent;
  }

  var _proto = History.prototype;

  _proto.startup = function startup(record) {
    this.records = [record];
  };

  _proto.getRecords = function getRecords() {
    return [].concat(this.records);
  };

  _proto.getLength = function getLength() {
    return this.records.length;
  };

  _proto.getPages = function getPages() {
    return this.records.map(function (_ref) {
      var pagename = _ref.pagename,
          store = _ref.store;
      return {
        pagename: pagename,
        store: store,
        page: routeMeta.pages[pagename]
      };
    });
  };

  _proto.findRecord = function findRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.records.length - 1;
      }

      return this.records[keyOrIndex];
    }

    return this.records.find(function (item) {
      return item.key === keyOrIndex;
    });
  };

  _proto.findIndex = function findIndex(key) {
    return this.records.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto.getCurrentRecord = function getCurrentRecord() {
    return this.records[0].sub.records[0];
  };

  _proto.getCurrentSubHistory = function getCurrentSubHistory() {
    return this.records[0].sub;
  };

  _proto.push = function push(location, key) {
    var records = this.records;
    var store = records[0].store;

    if (!this.parent) {
      store = forkStore(store);
    }

    var newRecord = new HistoryRecord(location, key, this, store);
    var maxHistory = routeConfig.maxHistory;
    records.unshift(newRecord);
    var delList = records.splice(maxHistory);

    if (!this.parent) {
      delList.forEach(function (item) {
        item.store.destroy();
      });
    }
  };

  _proto.replace = function replace(location, key) {
    var records = this.records;
    var store = records[0].store;
    var newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  };

  _proto.relaunch = function relaunch(location, key) {
    var records = this.records;
    var store = records[0].store;
    var newRecord = new HistoryRecord(location, key, this, store);
    this.records = [newRecord];
  };

  _proto.preBack = function preBack(delta, overflowRedirect) {
    if (overflowRedirect === void 0) {
      overflowRedirect = false;
    }

    var records = this.records.slice(delta);

    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop());
      }
    }

    return records[0];
  };

  _proto.back = function back(delta, overflowRedirect) {
    if (overflowRedirect === void 0) {
      overflowRedirect = false;
    }

    var delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      var last = delList.pop();
      this.records.push(last);
    }

    if (!this.parent) {
      delList.forEach(function (item) {
        item.store.destroy();
      });
    }
  };

  return History;
}();