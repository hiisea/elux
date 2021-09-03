import {env, IStore, forkStore} from '@elux/core';
import {LocationState, routeMeta, RouteState} from './basic';

class RouteStack<T extends {destroy?: () => void}> {
  protected records: T[] = [];
  constructor(protected limit: number) {}

  startup(record: T): void {
    this.records = [record];
  }
  getCurrentItem(): T {
    return this.records[0];
  }
  getItems(): T[] {
    return [...this.records];
  }
  getLength(): number {
    return this.records.length;
  }
  getRecordAt(n: number): T | undefined {
    if (n < 0) {
      return this.records[this.records.length + n];
    } else {
      return this.records[n];
    }
  }
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
  public readonly pagename: string;
  public readonly params: Record<string, any>;
  public readonly key: string;
  public readonly recordKey: string;
  constructor(location: LocationState, public readonly historyStack: HistoryStack) {
    this.recordKey = env.isServer ? '0' : ++HistoryRecord.id + '';
    const {pagename, params} = location;
    this.pagename = pagename;
    this.params = params;
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
  push(routeState: RouteState): HistoryRecord {
    const newRecord = new HistoryRecord(routeState, this);
    this._push(newRecord);
    return newRecord;
  }
  replace(routeState: RouteState): HistoryRecord {
    const newRecord = new HistoryRecord(routeState, this);
    this._replace(newRecord);
    return newRecord;
  }
  relaunch(routeState: RouteState): HistoryRecord {
    const newRecord = new HistoryRecord(routeState, this);
    this._relaunch(newRecord);
    return newRecord;
  }
  findRecordByKey(recordKey: string): HistoryRecord | undefined {
    return this.records.find((item) => item.recordKey === recordKey);
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
      const {pagename} = record;
      return {pagename, store, page: routeMeta.pages[pagename]};
    });
  }
  push(routeState: RouteState): HistoryRecord {
    const curHistory = this.getCurrentItem();
    const store = forkStore(curHistory.store, routeState);
    const newHistory = new HistoryStack(this, store);
    const newRecord = new HistoryRecord(routeState, newHistory);
    newHistory.startup(newRecord);
    this._push(newHistory);
    return newRecord;
  }
  replace(routeState: RouteState): HistoryRecord {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(routeState);
  }
  relaunch(routeState: RouteState): HistoryRecord {
    const curHistory = this.getCurrentItem();
    const newRecord = curHistory.relaunch(routeState);
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
  testBack(delta: number, rootOnly: boolean): {record: HistoryRecord; overflow: boolean; steps: [number, number]} {
    let overflow = false;
    let record: HistoryRecord;
    const steps: [number, number] = [0, 0];
    if (rootOnly) {
      if (delta < this.records.length) {
        record = this.getRecordAt(delta)!.getCurrentItem();
        steps[0] = delta;
      } else {
        record = this.getRecordAt(-1)!.getCurrentItem();
        overflow = true;
      }
    } else {
      const [rootDelta, recordDelta] = this.countBack(delta);
      if (rootDelta < this.records.length) {
        record = this.getRecordAt(rootDelta)!.getRecordAt(recordDelta)!;
        steps[0] = rootDelta;
        steps[1] = recordDelta;
      } else {
        record = this.getRecordAt(-1)!.getRecordAt(-1)!;
        overflow = true;
      }
    }
    return {record, overflow, steps};
  }
  findRecordByKey(key: string): HistoryRecord | undefined {
    const arr = key.split('-');
    const historyStack = this.records.find((item) => item.stackkey === arr[0]);
    if (historyStack) {
      return historyStack.findRecordByKey(arr[1]);
    }
    return undefined;
  }
}
