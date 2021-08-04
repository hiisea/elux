import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { cloneStore } from '@elux/core';
import { routeConfig, routeMeta } from './basic';
export var HistoryRecord = function () {
  function HistoryRecord(location, key, history, store) {
    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "sub", void 0);

    _defineProperty(this, "frozenState", '');

    this.key = key;
    this.history = history;
    this.store = store;
    var pagename = location.pagename,
        params = location.params;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);
  }

  var _proto = HistoryRecord.prototype;

  _proto.getParams = function getParams() {
    return JSON.parse(this.query);
  };

  _proto.freeze = function freeze() {
    if (!this.frozenState) {
      this.frozenState = JSON.stringify(this.store.getState());
    }
  };

  _proto.getSnapshotState = function getSnapshotState() {
    if (this.frozenState) {
      if (typeof this.frozenState === 'string') {
        this.frozenState = JSON.parse(this.frozenState);
      }

      return this.frozenState;
    }

    return undefined;
  };

  _proto.getStore = function getStore() {
    return this.store;
  };

  return HistoryRecord;
}();
export var History = function () {
  function History(parent, record) {
    _defineProperty(this, "records", []);

    this.parent = parent;

    if (record) {
      this.records = [record];
    }
  }

  var _proto2 = History.prototype;

  _proto2.init = function init(record) {
    this.records = [record];
  };

  _proto2.getLength = function getLength() {
    return this.records.length;
  };

  _proto2.getPages = function getPages() {
    return this.records.map(function (_ref) {
      var pagename = _ref.pagename,
          key = _ref.key;
      return {
        pagename: pagename,
        page: routeMeta.pages[pagename],
        key: key
      };
    });
  };

  _proto2.findRecord = function findRecord(keyOrIndex) {
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

  _proto2.findIndex = function findIndex(key) {
    return this.records.findIndex(function (item) {
      return item.key === key;
    });
  };

  _proto2.getCurrentRecord = function getCurrentRecord() {
    return this.records[0].sub.records[0];
  };

  _proto2.getCurrentSubHistory = function getCurrentSubHistory() {
    return this.records[0].sub;
  };

  _proto2.push = function push(location, key) {
    var records = this.records;
    var store = records[0].getStore();

    if (!this.parent) {
      store = cloneStore(store);
    }

    var newRecord = new HistoryRecord(location, key, this, store);
    var maxHistory = routeConfig.maxHistory;
    records.unshift(newRecord);

    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  };

  _proto2.replace = function replace(location, key) {
    var records = this.records;
    var store = records[0].getStore();
    var newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  };

  _proto2.relaunch = function relaunch(location, key) {
    var records = this.records;
    var store = records[0].getStore();
    var newRecord = new HistoryRecord(location, key, this, store);
    this.records = [newRecord];
  };

  _proto2.preBack = function preBack(delta, overflowRedirect) {
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

  _proto2.back = function back(delta, overflowRedirect) {
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

    this.records = records;
  };

  return History;
}();