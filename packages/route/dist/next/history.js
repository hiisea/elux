import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env, forkStore } from '@elux/core';
import { routeMeta } from './basic';

class RouteStack {
  constructor(limit) {
    _defineProperty(this, "records", []);

    this.limit = limit;
  }

  startup(record) {
    this.records = [record];
  }

  getCurrentItem() {
    return this.records[0];
  }

  getItems() {
    return [...this.records];
  }

  getLength() {
    return this.records.length;
  }

  getRecordAt(n) {
    if (n < 0) {
      return this.records[this.records.length + n];
    } else {
      return this.records[n];
    }
  }

  _push(item) {
    const records = this.records;
    records.unshift(item);
    const delItem = records.splice(this.limit)[0];

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }
  }

  _replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }
  }

  _relaunch(item) {
    const delList = this.records;
    this.records = [item];
    delList.forEach(delItem => {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
  }

  back(delta) {
    const delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      const last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(delItem => {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
  }

}

export class HistoryRecord {
  constructor(location, historyStack) {
    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "pagename", void 0);

    _defineProperty(this, "params", void 0);

    _defineProperty(this, "recordKey", void 0);

    this.historyStack = historyStack;
    this.recordKey = env.isServer ? '0' : ++HistoryRecord.id + '';
    const {
      pagename,
      params
    } = location;
    this.pagename = pagename;
    this.params = params;
  }

  getKey() {
    return [this.historyStack.stackkey, this.recordKey].join('-');
  }

}

_defineProperty(HistoryRecord, "id", 0);

export class HistoryStack extends RouteStack {
  constructor(rootStack, store) {
    super(20);

    _defineProperty(this, "stackkey", void 0);

    this.rootStack = rootStack;
    this.store = store;
    this.stackkey = env.isServer ? '0' : ++HistoryStack.id + '';
  }

  push(routeState) {
    const newRecord = new HistoryRecord(routeState, this);

    this._push(newRecord);

    return newRecord;
  }

  replace(routeState) {
    const newRecord = new HistoryRecord(routeState, this);

    this._replace(newRecord);

    return newRecord;
  }

  relaunch(routeState) {
    const newRecord = new HistoryRecord(routeState, this);

    this._relaunch(newRecord);

    return newRecord;
  }

  findRecordByKey(recordKey) {
    return this.records.find(item => item.recordKey === recordKey);
  }

  destroy() {
    this.store.destroy();
  }

}

_defineProperty(HistoryStack, "id", 0);

export class RootStack extends RouteStack {
  constructor() {
    super(10);
  }

  getCurrentPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const {
        pagename
      } = record;
      return {
        pagename,
        store,
        page: routeMeta.pages[pagename]
      };
    });
  }

  push(routeState) {
    const curHistory = this.getCurrentItem();
    const store = forkStore(curHistory.store, routeState);
    const newHistory = new HistoryStack(this, store);
    const newRecord = new HistoryRecord(routeState, newHistory);
    newHistory.startup(newRecord);

    this._push(newHistory);

    return newRecord;
  }

  replace(routeState) {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(routeState);
  }

  relaunch(routeState) {
    const curHistory = this.getCurrentItem();
    const newRecord = curHistory.relaunch(routeState);

    this._relaunch(curHistory);

    return newRecord;
  }

  countBack(delta) {
    const historyStacks = this.records;
    const backSteps = [0, 0];

    for (let i = 0, k = historyStacks.length; i < k; i++) {
      const historyStack = historyStacks[i];
      const recordNum = historyStack.getLength();
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
  }

  testBack(delta, rootOnly) {
    let overflow = false;
    let record;
    const steps = [0, 0];

    if (rootOnly) {
      if (delta < this.records.length) {
        record = this.getRecordAt(delta).getCurrentItem();
        steps[0] = delta;
      } else {
        record = this.getRecordAt(-1).getCurrentItem();
        overflow = true;
      }
    } else {
      const [rootDelta, recordDelta] = this.countBack(delta);

      if (rootDelta < this.records.length) {
        record = this.getRecordAt(rootDelta).getRecordAt(recordDelta);
        steps[0] = rootDelta;
        steps[1] = recordDelta;
      } else {
        record = this.getRecordAt(-1).getRecordAt(-1);
        overflow = true;
      }
    }

    return {
      record,
      overflow,
      steps
    };
  }

  findRecordByKey(key) {
    const arr = key.split('-');
    const historyStack = this.records.find(item => item.stackkey === arr[0]);

    if (historyStack) {
      return historyStack.findRecordByKey(arr[1]);
    }

    return undefined;
  }

}