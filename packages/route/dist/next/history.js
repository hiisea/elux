import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { cloneStore } from '@elux/core';
import { routeConfig, routeMeta } from './basic';
export class HistoryRecord {
  constructor(location, key, history, store) {
    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "sub", void 0);

    _defineProperty(this, "frozenState", '');

    this.key = key;
    this.history = history;
    this.store = store;
    const {
      pagename,
      params
    } = location;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);
  }

  getParams() {
    return JSON.parse(this.query);
  }

  freeze() {
    if (!this.frozenState) {
      this.frozenState = JSON.stringify(this.store.getState());
    }
  }

  getSnapshotState() {
    if (this.frozenState) {
      if (typeof this.frozenState === 'string') {
        this.frozenState = JSON.parse(this.frozenState);
      }

      return this.frozenState;
    }

    return undefined;
  }

  getStore() {
    return this.store;
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

  init(record) {
    this.records = [record];
  }

  getLength() {
    return this.records.length;
  }

  getPages() {
    return this.records.map(({
      pagename
    }) => {
      return {
        pagename,
        page: routeMeta.pages[pagename]
      };
    });
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

  getCurrentRecord() {
    return this.records[0].sub.records[0];
  }

  getCurrentSubHistory() {
    return this.records[0].sub;
  }

  push(location, key) {
    const records = this.records;
    let store = records[0].getStore();

    if (!this.parent) {
      store = cloneStore(store);
    }

    const newRecord = new HistoryRecord(location, key, this, store);
    const maxHistory = routeConfig.maxHistory;
    records.unshift(newRecord);

    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  }

  replace(location, key) {
    const records = this.records;
    const store = records[0].getStore();
    const newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  }

  relaunch(location, key) {
    const records = this.records;
    let store = records[0].getStore();

    if (!this.parent) {
      store = cloneStore(store);
    }

    const newRecord = new HistoryRecord(location, key, this, store);
    this.records = [newRecord];
  }

  preBack(delta, overflowRedirect = false) {
    const records = this.records.slice(delta);

    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop());
      }
    }

    return records[0];
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
  }

}