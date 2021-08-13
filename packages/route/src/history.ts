import {IStore, forkStore} from '@elux/core';
import {Location, routeMeta} from './basic';

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
  public readonly recordKey: string;
  constructor(location: Location, public readonly historyStack: HistoryStack) {
    this.recordKey = ++HistoryRecord.id + '';
    const {pagename, params} = location;
    this.pagename = pagename;
    this.params = params;
    //this.query = JSON.stringify(params);
  }
  getKey(): string {
    return [this.historyStack.stackkey, this.recordKey].join('-');
  }
}
export class HistoryStack extends RouteStack<HistoryRecord> {
  static id = 0;
  public readonly stackkey: string;
  constructor(public readonly rootStack: RootStack, public readonly store: IStore) {
    super(20);
    this.stackkey = ++HistoryStack.id + '';
  }
  push(location: Location): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
    this._push(newRecord);
    return newRecord;
  }
  replace(location: Location): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
    this._replace(newRecord);
    return newRecord;
  }
  relaunch(location: Location): HistoryRecord {
    const newRecord = new HistoryRecord(location, this);
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
  push(location: Location): HistoryRecord {
    const curHistory = this.getCurrentItem();
    const store = forkStore(curHistory.store);
    const newHistory = new HistoryStack(this, store);
    const newRecord = new HistoryRecord(location, newHistory);
    newHistory.startup(newRecord);
    this._push(newHistory);
    return newRecord;
  }
  replace(location: Location): HistoryRecord {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  }
  relaunch(location: Location): HistoryRecord {
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

// export class History {
//   private records: HistoryRecord[] = [];

//   startup(record: HistoryRecord): void {
//     this.records = [record];
//   }
//   getRecords(): HistoryRecord[] {
//     return [...this.records];
//   }
//   getLength(): number {
//     return this.records.length;
//   }
//   getPages(): {pagename: string; store: IStore; page?: any}[] {
//     return this.records.map(({pagename, store}) => {
//       return {pagename, store, page: routeMeta.pages[pagename]};
//     });
//   }
//   findRecord(keyOrIndex: number | string): HistoryRecord | undefined {
//     if (typeof keyOrIndex === 'number') {
//       if (keyOrIndex === -1) {
//         keyOrIndex = this.records.length - 1;
//       }
//       return this.records[keyOrIndex];
//     }
//     return this.records.find((item) => item.key === keyOrIndex);
//   }
//   findIndex(key: string): number {
//     return this.records.findIndex((item) => item.key === key);
//   }
//   getCurrentRecord(): HistoryRecord {
//     return this.records[0].sub.records[0];
//   }
//   getCurrentSubHistory(): History {
//     return this.records[0].sub;
//   }
//   push(location: Location, key: string): void {
//     const records = this.records;
//     let store: IStore = records[0].store;
//     if (!this.parent) {
//       store = forkStore(store);
//     }
//     const newRecord = new HistoryRecord(location, key, this, store);
//     const maxHistory = routeConfig.maxHistory;
//     records.unshift(newRecord);
//     const delList = records.splice(maxHistory);
//     if (!this.parent) {
//       delList.forEach((item) => {
//         item.store.destroy();
//       });
//     }
//   }
//   replace(location: Location, key: string): void {
//     const records = this.records;
//     const store: IStore = records[0].store;
//     const newRecord = new HistoryRecord(location, key, this, store);
//     records[0] = newRecord;
//   }
//   relaunch(location: Location, key: string): void {
//     const records = this.records;
//     const store: IStore = records[0].store;
//     const newRecord = new HistoryRecord(location, key, this, store);
//     this.records = [newRecord];
//   }
//   preBack(delta: number, overflowRedirect = false): HistoryRecord | undefined {
//     const records = this.records.slice(delta);
//     if (records.length === 0) {
//       if (overflowRedirect) {
//         return undefined;
//       } else {
//         records.push(this.records.pop()!);
//       }
//     }
//     return records[0];
//   }
//   back(delta: number, overflowRedirect = false): void {
//     const delList = this.records.splice(0, delta);
//     if (this.records.length === 0) {
//       const last = delList.pop()!;
//       this.records.push(last);
//     }
//     if (!this.parent) {
//       delList.forEach((item) => {
//         item.store.destroy();
//       });
//     }
//   }
// }

// export class History {
//   private records: HistoryRecord[] = [];

//   constructor(public readonly parent?: History) {}
//   startup(record: HistoryRecord): void {
//     this.records = [record];
//   }
//   getRecords(): HistoryRecord[] {
//     return [...this.records];
//   }
//   getLength(): number {
//     return this.records.length;
//   }
//   getPages(): {pagename: string; store: IStore; page?: any}[] {
//     return this.records.map(({pagename, store}) => {
//       return {pagename, store, page: routeMeta.pages[pagename]};
//     });
//   }
//   findRecord(keyOrIndex: number | string): HistoryRecord | undefined {
//     if (typeof keyOrIndex === 'number') {
//       if (keyOrIndex === -1) {
//         keyOrIndex = this.records.length - 1;
//       }
//       return this.records[keyOrIndex];
//     }
//     return this.records.find((item) => item.key === keyOrIndex);
//   }
//   findIndex(key: string): number {
//     return this.records.findIndex((item) => item.key === key);
//   }
//   getCurrentRecord(): HistoryRecord {
//     return this.records[0].sub.records[0];
//   }
//   getCurrentSubHistory(): History {
//     return this.records[0].sub;
//   }
//   push(location: Location, key: string): void {
//     const records = this.records;
//     let store: IStore = records[0].store;
//     if (!this.parent) {
//       store = forkStore(store);
//     }
//     const newRecord = new HistoryRecord(location, key, this, store);
//     const maxHistory = routeConfig.maxHistory;
//     records.unshift(newRecord);
//     const delList = records.splice(maxHistory);
//     if (!this.parent) {
//       delList.forEach((item) => {
//         item.store.destroy();
//       });
//     }
//   }
//   replace(location: Location, key: string): void {
//     const records = this.records;
//     const store: IStore = records[0].store;
//     const newRecord = new HistoryRecord(location, key, this, store);
//     records[0] = newRecord;
//   }
//   relaunch(location: Location, key: string): void {
//     const records = this.records;
//     const store: IStore = records[0].store;
//     const newRecord = new HistoryRecord(location, key, this, store);
//     this.records = [newRecord];
//   }
//   preBack(delta: number, overflowRedirect = false): HistoryRecord | undefined {
//     const records = this.records.slice(delta);
//     if (records.length === 0) {
//       if (overflowRedirect) {
//         return undefined;
//       } else {
//         records.push(this.records.pop()!);
//       }
//     }
//     return records[0];
//   }
//   back(delta: number, overflowRedirect = false): void {
//     const delList = this.records.splice(0, delta);
//     if (this.records.length === 0) {
//       const last = delList.pop()!;
//       this.records.push(last);
//     }
//     if (!this.parent) {
//       delList.forEach((item) => {
//         item.store.destroy();
//       });
//     }
//   }
// }
