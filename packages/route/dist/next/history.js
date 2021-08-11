import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { forkStore } from '@elux/core';
import { routeConfig, routeMeta } from './basic';
export class HistoryRecord {
  constructor(location, key, history, store) {
    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "params", void 0);

    _defineProperty(this, "sub", void 0);

    this.key = key;
    this.history = history;
    this.store = store;
    const {
      pagename,
      params
    } = location;
    this.pagename = pagename;
    this.params = params;
    this.sub = new History(history);
    this.sub.startup(this);
  }

}
export class History {
  constructor(parent) {
    _defineProperty(this, "records", []);

    this.parent = parent;
  }

  startup(record) {
    this.records = [record];
  }

  getRecords() {
    return [...this.records];
  }

  getLength() {
    return this.records.length;
  }

  getPages() {
    return this.records.map(({
      pagename,
      store
    }) => {
      return {
        pagename,
        store,
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
    let store = records[0].store;

    if (!this.parent) {
      store = forkStore(store);
    }

    const newRecord = new HistoryRecord(location, key, this, store);
    const maxHistory = routeConfig.maxHistory;
    records.unshift(newRecord);
    const delList = records.splice(maxHistory);

    if (!this.parent) {
      delList.forEach(item => {
        item.store.destroy();
      });
    }
  }

  replace(location, key) {
    const records = this.records;
    const store = records[0].store;
    const newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  }

  relaunch(location, key) {
    const records = this.records;
    const store = records[0].store;
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
    const delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      const last = delList.pop();
      this.records.push(last);
    }

    if (!this.parent) {
      delList.forEach(item => {
        item.store.destroy();
      });
    }
  }

}