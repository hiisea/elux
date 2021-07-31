import {IStore, cloneStore} from '@elux/core';
import {Location, routeConfig} from './basic';

export class HistoryRecord {
  pagename: string;
  query: string;
  sub: History;
  private frozenState: any = '';
  constructor(location: Location, public readonly key: string, public readonly history: History, private store: IStore) {
    const {pagename, params} = location;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);
  }
  getParams(): any {
    return JSON.parse(this.query);
  }
  freeze(): void {
    if (!this.frozenState) {
      this.frozenState = JSON.stringify(this.store.getState());
    }
  }
  getFrozenState(): Record<string, any> | undefined {
    if (this.frozenState) {
      if (typeof this.frozenState === 'string') {
        this.frozenState = JSON.parse(this.frozenState);
      }
      return this.frozenState;
    }
    return undefined;
  }
  getStore(): IStore<any> {
    return this.store;
  }
}
export class History {
  private records: HistoryRecord[] = [];

  constructor(private parent?: History, record?: HistoryRecord) {
    if (record) {
      this.records = [record];
    }
  }
  init(record: HistoryRecord): void {
    this.records = [record];
  }
  getLength(): number {
    return this.records.length;
  }
  findRecord(keyOrIndex: number | string): HistoryRecord | undefined {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.records.length - 1;
      }
      return this.records[keyOrIndex];
    }
    return this.records.find((item) => item.key === keyOrIndex);
  }
  findIndex(key: string): number {
    return this.records.findIndex((item) => item.key === key);
  }
  getCurrentRecord(): HistoryRecord {
    return this.records[0].sub.records[0];
  }
  getCurrentSubHistory(): History {
    return this.records[0].sub;
  }
  push(location: Location, key: string): void {
    const records = this.records;
    let store: IStore = records[0].getStore();
    if (!this.parent) {
      store = cloneStore(store);
    }
    const newRecord = new HistoryRecord(location, key, this, store);
    const maxHistory = routeConfig.maxHistory;
    records[0].freeze();
    records.unshift(newRecord);
    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  }
  replace(location: Location, key: string): void {
    const records = this.records;
    const store: IStore = records[0].getStore();
    const newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  }
  relaunch(location: Location, key: string): void {
    const records = this.records;
    const store: IStore = records[0].getStore();
    const newRecord = new HistoryRecord(location, key, this, store);
    this.records = [newRecord];
  }
  preBack(delta: number, overflowRedirect = false): HistoryRecord | undefined {
    const records = this.records.slice(delta);
    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop()!);
      }
    }
    return records[0];
  }
  back(delta: number, overflowRedirect = false): void {
    const records = this.records.slice(delta);
    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop()!);
      }
    }
    this.records = records;
  }
}
