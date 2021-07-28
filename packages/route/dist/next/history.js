import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { routeConfig } from './basic';
export class HistoryRecord {
  constructor(location, key, history) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "sub", void 0);

    const {
      pagename,
      params
    } = location;
    this.key = key;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);

    if (history.records.length === 0) {
      history.records = [this];
    }
  }

  getParams() {
    return JSON.parse(this.query);
  }

}
export class History {
  constructor(parent, record) {
    _defineProperty(this, "records", []);

    this.parent = parent;

    if (record) {
      this.records = [record];
    }
  }

  getCurRecord() {
    return this.records[0];
  }

  getLength() {
    return this.records.length;
  }

  findRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.records.length - 1;
      }

      return this.records[keyOrIndex];
    }

    return this.records.find(item => item.key === keyOrIndex);
  }

  findIndex(key) {
    return this.records.findIndex(item => item.key === key);
  }

  getCurrentSubHistory() {
    return this.getCurRecord().sub;
  }

  getStack() {
    return [...this.records];
  }

  push(location, key) {
    const newRecord = new HistoryRecord(location, key, this);
    const maxHistory = routeConfig.maxHistory;
    const records = this.records;
    records.unshift(newRecord);

    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  }

  replace(location, key) {
    const newRecord = new HistoryRecord(location, key, this);
    this.records[0] = newRecord;
  }

  relaunch(location, key) {
    const newRecord = new HistoryRecord(location, key, this);
    this.records = [newRecord];
  }

  back(delta, overflowRedirect = false) {
    const records = this.records.slice(delta);

    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop());
      }
    }

    this.records = records;
    return this.records[0];
  }

}