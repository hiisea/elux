export class HistoryStack {
  constructor(limit) {
    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.setActive();
  }

  onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.setInactive();
      this.currentRecord = this.records[0];
      this.currentRecord.setActive();
    }
  }

  getCurrentItem() {
    return this.currentRecord;
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

  push(item) {
    const records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      const delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  }

  replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  }

  relaunch(item) {
    const delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(delItem => {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
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
    this.onChanged();
  }

}
export class RouteRecord {
  constructor(location, pageStack) {
    this.key = void 0;
    this.title = void 0;
    this.location = location;
    this.pageStack = pageStack;
    this.key = [pageStack.key, pageStack.id++].join('_');
    this.title = '';
  }

  setActive() {
    return;
  }

  setInactive() {
    return;
  }

  destroy() {
    return;
  }

}
export class PageStack extends HistoryStack {
  constructor(windowStack, location, store) {
    super(20);
    this.id = 0;
    this.key = void 0;
    this._store = void 0;
    this.windowStack = windowStack;
    this._store = store;
    this.key = '' + windowStack.id++;
    this.init(new RouteRecord(location, this));
  }

  get store() {
    return this._store;
  }

  replaceStore(store) {
    if (this._store !== store) {
      this._store.destroy();

      this._store = store;
      store.setActive();
    }
  }

  findRecordByKey(key) {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  }

  setActive() {
    this.store.setActive();
  }

  setInactive() {
    this.store.setInactive();
  }

  destroy() {
    this.store.destroy();
  }

}
export class WindowStack extends HistoryStack {
  constructor(location, store) {
    super(10);
    this.id = 0;
    this.init(new PageStack(this, location, store));
  }

  getRecords() {
    return this.records.map(item => item.getCurrentItem());
  }

  getCurrentWindowPage() {
    const item = this.getCurrentItem();
    const store = item.store;
    const record = item.getCurrentItem();
    const location = record.location;
    return {
      store,
      location
    };
  }

  getCurrentPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const location = record.location;
      return {
        store,
        location
      };
    });
  }

  countBack(delta) {
    const historyStacks = this.records;
    const backSteps = [0, 0];

    for (let i = 0, k = historyStacks.length; i < k; i++) {
      const pageStack = historyStacks[i];
      const recordNum = pageStack.getLength();
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
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: false,
        index: [this.records.length - 1, pageStack.getLength() - 1]
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
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: true,
        index: [this.records.length - 1, pageStack.getLength() - 1]
      };
    }
  }

  findRecordByKey(key) {
    const arr = key.split('_');

    if (arr[0] && arr[1]) {
      for (let i = 0, k = this.records.length; i < k; i++) {
        const pageStack = this.records[i];

        if (pageStack.key === arr[0]) {
          const item = pageStack.findRecordByKey(key);

          if (item) {
            return {
              record: item[0],
              index: [i, item[1]],
              overflow: false
            };
          }
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