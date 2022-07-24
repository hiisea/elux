import {IRouteRecord, Location} from './basic';
import {Store} from './store';

export class HistoryStack<T extends {destroy: () => void; setActive: () => void; setInactive: () => void}> {
  private currentRecord: T = undefined as any;
  protected records: T[] = [];

  constructor(protected limit: number) {}

  protected init(record: T): void {
    this.records = [record];
    this.currentRecord = record;
    record.setActive();
  }
  protected onChanged(): void {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.setInactive();
      this.currentRecord = this.records[0];
      this.currentRecord.setActive();
    }
  }
  getCurrentItem(): T {
    return this.currentRecord;
  }
  getEarliestItem(): T {
    return this.records[this.records.length - 1]!;
  }
  getItemAt(n: number): T | undefined {
    return this.records[n];
  }
  getItems(): T[] {
    return [...this.records];
  }
  getLength(): number {
    return this.records.length;
  }
  // getRecordAt(n: number): T | undefined {
  //   if (n < 0) {
  //     return this.records[this.records.length + n];
  //   } else {
  //     return this.records[n];
  //   }
  // }
  push(item: T): void {
    const records = this.records;
    records.unshift(item);
    if (records.length > this.limit) {
      const delItem = records.pop()!;
      delItem !== item && delItem.destroy();
    }
    this.onChanged();
  }
  replace(item: T): void {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  }
  relaunch(item: T): void {
    const delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach((delItem) => {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  }
  // protected _preBack(delta: number): {item: T; overflow: number} {
  //   let overflow = 0;
  //   const records = this.records.slice(delta);
  //   if (records.length === 0) {
  //     overflow = delta - this.records.length + 1;
  //     records.push(this.records.pop()!);
  //   }
  //   return {item: records[0], overflow};
  // }
  back(delta: number): void {
    const delList = this.records.splice(0, delta);
    if (this.records.length === 0) {
      const last = delList.pop()!;
      this.records.push(last);
    }
    delList.forEach((delItem) => {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.onChanged();
  }
}

export class RouteRecord implements IRouteRecord {
  public readonly key: string;
  public title: string;
  constructor(public readonly location: Location, public readonly pageStack: PageStack) {
    this.key = [pageStack.key, pageStack.id++].join('_');
    this.title = '';
  }
  setActive(): void {
    return;
  }
  setInactive(): void {
    return;
  }
  destroy(): void {
    return;
  }
}

export class PageStack extends HistoryStack<RouteRecord> {
  public id = 0;
  public readonly key: string;
  private _store: Store;
  constructor(public readonly windowStack: WindowStack, location: Location, store: Store) {
    super(20);
    this._store = store;
    this.key = '' + windowStack.id++;
    this.init(new RouteRecord(location, this));
  }
  get store(): Store {
    return this._store;
  }
  replaceStore(store: Store): void {
    if (this._store !== store) {
      this._store.destroy();
      this._store = store;
      store.setActive();
    }
  }
  findRecordByKey(key: string): [RouteRecord, number] | undefined {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];
      if (item.key === key) {
        return [item, i];
      }
    }
    return undefined;
  }
  setActive(): void {
    this.store.setActive();
  }
  setInactive(): void {
    this.store.setInactive();
  }
  destroy(): void {
    this.store.destroy();
  }
}

export class WindowStack extends HistoryStack<PageStack> {
  public id = 0;
  constructor(location: Location, store: Store) {
    super(10);
    this.init(new PageStack(this, location, store));
  }
  getRecords(): RouteRecord[] {
    return this.records.map((item) => item.getCurrentItem());
  }
  getCurrentWindowPage(): {store: Store; location: Location} {
    const item = this.getCurrentItem();
    const store = item.store;
    const record = item.getCurrentItem();
    const location = record.location;
    return {store, location};
  }
  getCurrentPages(): {store: Store; location: Location}[] {
    return this.records.map((item) => {
      const store = item.store;
      const record = item.getCurrentItem();
      const location = record.location;
      return {store, location};
    });
  }
  private countBack(delta: number): [number, number] {
    const historyStacks = this.records;
    const backSteps: [number, number] = [0, 0];
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
  testBack(stepOrKey: number | string, rootOnly: boolean): {record: RouteRecord; overflow: boolean; index: [number, number]} {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }
    const delta = stepOrKey;
    if (delta === 0) {
      const record = this.getCurrentItem().getCurrentItem();
      return {record, overflow: false, index: [0, 0]};
    }
    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        const record = this.getEarliestItem().getCurrentItem();
        return {record, overflow: !(delta < 0), index: [this.records.length - 1, 0]};
      } else {
        const record = this.getItemAt(delta)!.getCurrentItem();
        return {record, overflow: false, index: [delta, 0]};
      }
    }
    if (delta < 0) {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {record, overflow: false, index: [this.records.length - 1, pageStack.getLength() - 1]};
    }
    const [rootDelta, recordDelta] = this.countBack(delta);
    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta)!.getItemAt(recordDelta)!;
      return {record, overflow: false, index: [rootDelta, recordDelta]};
    } else {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {record, overflow: true, index: [this.records.length - 1, pageStack.getLength() - 1]};
    }
  }
  findRecordByKey(key: string): {record: RouteRecord; overflow: boolean; index: [number, number]} {
    const arr = key.split('_');
    if (arr[0] && arr[1]) {
      for (let i = 0, k = this.records.length; i < k; i++) {
        const pageStack = this.records[i];
        if (pageStack.key === arr[0]) {
          const item = pageStack.findRecordByKey(key);
          if (item) {
            return {record: item[0], index: [i, item[1]], overflow: false};
          }
        }
      }
    }
    return {record: this.getCurrentItem().getCurrentItem(), index: [0, 0], overflow: true};
  }
}
