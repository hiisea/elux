import {env, IStore, forkStore} from '@elux/core';
import {routeMeta, RouteState} from './basic';
import {ILocationTransform} from './transform';
class RouteStack<T extends {destroy?: () => void}> {
  public records: T[] = [];
  constructor(protected limit: number) {}

  startup(record: T): void {
    this.records = [record];
  }
  getCurrentItem(): T {
    return this.records[0];
  }
  getEarliestItem(): T {
    return this.records[this.records.length - 1];
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
  protected _push(item: T): void {
    const records = this.records;
    records.unshift(item);
    const delItem = records.splice(this.limit)[0];
    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }
  }
  protected _replace(item: T): void {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }
  }
  protected _relaunch(item: T): void {
    const delList = this.records;
    this.records = [item];
    delList.forEach((delItem) => {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
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
  }
}

export class HistoryRecord {
  static id = 0;
  public readonly destroy: undefined;
  // public readonly pagename: string;
  // public readonly params: Record<string, any>;
  public readonly key: string;
  public readonly recordKey: string;
  constructor(public readonly location: ILocationTransform, public readonly historyStack: HistoryStack) {
    this.recordKey = env.isServer ? '0' : ++HistoryRecord.id + '';
    // const {pagename, params} = location;
    // this.pagename = pagename;
    // this.params = params;
    this.key = [historyStack.stackkey, this.recordKey].join('-');
    //this.query = JSON.stringify(params);
  }
}
export class HistoryStack extends RouteStack<HistoryRecord> {
  static id = 0;
  public readonly stackkey: string;
  constructor(public readonly rootStack: RootStack, public readonly store: IStore) {
    super(20);
    this.stackkey = env.isServer ? '0' : ++HistoryStack.id + '';
  }
  push(location: ILocationTransform): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
    this._push(newRecord);
    return newRecord;
  }
  replace(location: ILocationTransform): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
    this._replace(newRecord);
    return newRecord;
  }
  relaunch(location: ILocationTransform): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
    this._relaunch(newRecord);
    return newRecord;
  }
  findRecordByKey(recordKey: string): [HistoryRecord, number] | undefined {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];
      if (item.recordKey === recordKey) {
        return [item, i];
      }
    }
    return undefined;
  }
  destroy(): void {
    this.store.destroy();
  }
}
export class RootStack extends RouteStack<HistoryStack> {
  constructor() {
    super(10);
  }
  getCurrentPages(): {pagename: string; store: IStore; page?: any}[] {
    return this.records.map((item) => {
      const store = item.store;
      const record = item.getCurrentItem();
      const pagename = record.location.getPagename();
      return {pagename, store, page: routeMeta.pages[pagename]};
    });
  }
  push(location: ILocationTransform): HistoryRecord {
    const curHistory = this.getCurrentItem();
    const routeState: RouteState = {pagename: location.getPagename(), params: location.getParams(), action: 'RELAUNCH', key: ''};
    const store = forkStore(curHistory.store, routeState);
    const newHistory = new HistoryStack(this, store);
    const newRecord = new HistoryRecord(location, newHistory);
    newHistory.startup(newRecord);
    this._push(newHistory);
    return newRecord;
  }
  replace(location: ILocationTransform): HistoryRecord {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  }
  relaunch(location: ILocationTransform): HistoryRecord {
    const curHistory = this.getCurrentItem();
    const newRecord = curHistory.relaunch(location);
    this._relaunch(curHistory);
    return newRecord;
  }
  private countBack(delta: number): [number, number] {
    const historyStacks = this.records;
    const backSteps: [number, number] = [0, 0];
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
  testBack(stepOrKey: number | string, rootOnly: boolean): {record: HistoryRecord; overflow: boolean; index: [number, number]} {
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
      const historyStack = this.getEarliestItem();
      const record = historyStack.getEarliestItem();
      return {record, overflow: false, index: [this.records.length - 1, historyStack.records.length - 1]};
    }
    const [rootDelta, recordDelta] = this.countBack(delta);
    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta)!.getItemAt(recordDelta)!;
      return {record, overflow: false, index: [rootDelta, recordDelta]};
    } else {
      const historyStack = this.getEarliestItem();
      const record = historyStack.getEarliestItem();
      return {record, overflow: true, index: [this.records.length - 1, historyStack.records.length - 1]};
    }
  }
  findRecordByKey(key: string): {record: HistoryRecord; overflow: boolean; index: [number, number]} {
    const arr = key.split('-');
    for (let i = 0, k = this.records.length; i < k; i++) {
      const historyStack = this.records[i];
      if (historyStack.stackkey === arr[0]) {
        const item = historyStack.findRecordByKey(arr[1]);
        if (item) {
          return {record: item[0], index: [i, item[1]], overflow: false};
        }
      }
    }
    return {record: this.getCurrentItem().getCurrentItem(), index: [0, 0], overflow: true};
  }
}
