import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { forkStore } from '@elux/core';
import { routeConfig, routeMeta } from './basic';
export class HistoryRecord {
  constructor(location, key, history, store) {
    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "query", void 0);

    _defineProperty(this, "sub", void 0);

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
      pagename,
      key
    }) => {
      return {
        pagename,
        page: routeMeta.pages[pagename],
        key
      };
    });
  }

  getStores() {
    return this.records.map(({
      store
    }) => {
      return store;
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

  push(location, key, routeState) {
    const records = this.records;
    let store = records[0].store;

    if (!this.parent) {
      const state = store.getState();
      const cloneData = Object.keys(routeState.params).reduce((data, moduleName) => {
        data[moduleName] = state[moduleName];
        return data;
      }, {});
      const prevState = JSON.parse(JSON.stringify(cloneData));
      Object.keys(prevState).forEach(moduleName => {
        delete prevState[moduleName].loading;
      });
      prevState.route = routeState;
      store = forkStore(store, prevState);
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