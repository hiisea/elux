import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env, forkStore } from '@elux/core';
import { routeMeta, routeConfig } from './basic';

class RouteStack {
  constructor(limit) {
    _defineProperty(this, "records", []);

    this.limit = limit;
  }

  startup(record) {
    const oItem = this.records[0];
    this.records = [record];
    this.setActive(oItem);
  }

  getCurrentItem() {
    return this.records[0];
  }

  getEarliestItem() {
    return this.records[this.records.length - 1];
  }

  getItemAt(n) {
    return this.records[n];
  }

  getItems() {
    return [...this.records];
  }

  getLength() {
    return this.records.length;
  }

  _push(item) {
    const records = this.records;
    const oItem = records[0];
    records.unshift(item);
    const delItem = records.splice(this.limit)[0];

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(oItem);
  }

  _replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(delItem);
  }

  _relaunch(item) {
    const delList = this.records;
    const oItem = delList[0];
    this.records = [item];
    delList.forEach(delItem => {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  }

  back(delta) {
    const oItem = this.records[0];
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
    this.setActive(oItem);
  }

  setActive(oItem) {
    var _this$records$;

    const oStore = oItem == null ? void 0 : oItem.store;
    const store = (_this$records$ = this.records[0]) == null ? void 0 : _this$records$.store;

    if (store === oStore) {
      store == null ? void 0 : store.setActive(true);
    } else {
      oStore == null ? void 0 : oStore.setActive(false);
      store == null ? void 0 : store.setActive(true);
    }
  }

}

export class HistoryRecord {
  constructor(location, historyStack) {
    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "recordKey", void 0);

    this.location = location;
    this.historyStack = historyStack;
    this.recordKey = env.isServer ? '0' : ++HistoryRecord.id + '';
    this.key = [historyStack.stackkey, this.recordKey].join('-');
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

  push(location) {
    const newRecord = new HistoryRecord(location, this);

    this._push(newRecord);

    return newRecord;
  }

  replace(location) {
    const newRecord = new HistoryRecord(location, this);

    this._replace(newRecord);

    return newRecord;
  }

  relaunch(location) {
    const newRecord = new HistoryRecord(location, this);

    this._relaunch(newRecord);

    return newRecord;
  }

  findRecordByKey(recordKey) {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];

      if (item.recordKey === recordKey) {
        return [item, i];
      }
    }

    return undefined;
  }

  destroy() {
    this.store.destroy();
  }

}

_defineProperty(HistoryStack, "id", 0);

export class RootStack extends RouteStack {
  constructor() {
    super(routeConfig.maxHistory);
  }

  getCurrentPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const pagename = record.location.getPagename();
      return {
        pagename,
        store,
        pageData: routeMeta.pageDatas[pagename]
      };
    });
  }

  push(location) {
    const curHistory = this.getCurrentItem();
    const routeState = {
      pagename: location.getPagename(),
      params: location.getParams(),
      action: 'RELAUNCH',
      key: ''
    };
    const store = forkStore(curHistory.store, routeState);
    const newHistory = new HistoryStack(this, store);
    const newRecord = new HistoryRecord(location, newHistory);
    newHistory.startup(newRecord);

    this._push(newHistory);

    return newRecord;
  }

  replace(location) {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  }

  relaunch(location) {
    const curHistory = this.getCurrentItem();
    const newRecord = curHistory.relaunch(location);

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

  testBack(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    const delta = stepOrKey;

    if (delta === 0) {
      const record = this.getCurrentItem().getCurrentItem();
      return {
        record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        const record = this.getEarliestItem().getCurrentItem();
        return {
          record,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        const record = this.getItemAt(delta).getCurrentItem();
        return {
          record,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      const historyStack = this.getEarliestItem();
      const record = historyStack.getEarliestItem();
      return {
        record,
        overflow: false,
        index: [this.records.length - 1, historyStack.records.length - 1]
      };
    }

    const [rootDelta, recordDelta] = this.countBack(delta);

    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta).getItemAt(recordDelta);
      return {
        record,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      const historyStack = this.getEarliestItem();
      const record = historyStack.getEarliestItem();
      return {
        record,
        overflow: true,
        index: [this.records.length - 1, historyStack.records.length - 1]
      };
    }
  }

  findRecordByKey(key) {
    const arr = key.split('-');

    for (let i = 0, k = this.records.length; i < k; i++) {
      const historyStack = this.records[i];

      if (historyStack.stackkey === arr[0]) {
        const item = historyStack.findRecordByKey(arr[1]);

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
  }

}