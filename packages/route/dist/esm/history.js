import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { routeConfig } from './basic';
export var HistoryRecord = function () {
  function HistoryRecord(location, key, history) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "sub", void 0);

    var pagename = location.pagename,
        params = location.params;
    this.key = key;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);

    if (history.records.length === 0) {
      history.records = [this];
    }
  }

  var _proto = HistoryRecord.prototype;

  _proto.getParams = function getParams() {
    return JSON.parse(this.query);
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

  _proto2.getCurRecord = function getCurRecord() {
    return this.records[0];
  };

  _proto2.getLength = function getLength() {
    return this.records.length;
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

  _proto2.getCurrentSubHistory = function getCurrentSubHistory() {
    return this.getCurRecord().sub;
  };

  _proto2.getStack = function getStack() {
    return [].concat(this.records);
  };

  _proto2.push = function push(location, key) {
    var newRecord = new HistoryRecord(location, key, this);
    var maxHistory = routeConfig.maxHistory;
    var records = this.records;
    records.unshift(newRecord);

    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  };

  _proto2.replace = function replace(location, key) {
    var newRecord = new HistoryRecord(location, key, this);
    this.records[0] = newRecord;
  };

  _proto2.relaunch = function relaunch(location, key) {
    var newRecord = new HistoryRecord(location, key, this);
    this.records = [newRecord];
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
    return this.records[0];
  };

  return History;
}();