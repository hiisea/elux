import {IStore, forkStore} from '@elux/core';
import {Location, routeConfig, routeMeta} from './basic';

export class HistoryRecord {
  public readonly pagename: string;
  public readonly params: Record<string, any>;
  public readonly sub: History;
  constructor(location: Location, public readonly key: string, public readonly history: History, public readonly store: IStore) {
    const {pagename, params} = location;
    this.pagename = pagename;
    this.params = params;
    //this.query = JSON.stringify(params);
    this.sub = new History(history);
    this.sub.startup(this);
  }
}
export class History {
  private records: HistoryRecord[] = [];

  constructor(private parent: History | null) {}
  startup(record: HistoryRecord): void {
    this.records = [record];
  }
  getRecords(): HistoryRecord[] {
    return [...this.records];
  }
  getLength(): number {
    return this.records.length;
  }
  getPages(): {pagename: string; store: IStore; page?: any}[] {
    return this.records.map(({pagename, store}) => {
      return {pagename, store, page: routeMeta.pages[pagename]};
    });
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
    let store: IStore = records[0].store;
    if (!this.parent) {
      store = forkStore(store);
    }
    const newRecord = new HistoryRecord(location, key, this, store);
    const maxHistory = routeConfig.maxHistory;
    records.unshift(newRecord);
    const delList = records.splice(maxHistory);
    if (!this.parent) {
      delList.forEach((item) => {
        item.store.destroy();
      });
    }
  }
  replace(location: Location, key: string): void {
    const records = this.records;
    const store: IStore = records[0].store;
    const newRecord = new HistoryRecord(location, key, this, store);
    records[0] = newRecord;
  }
  relaunch(location: Location, key: string): void {
    const records = this.records;
    const store: IStore = records[0].store;
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
    const delList = this.records.splice(0, delta);
    if (this.records.length === 0) {
      const last = delList.pop()!;
      this.records.push(last);
    }
    if (!this.parent) {
      delList.forEach((item) => {
        item.store.destroy();
      });
    }
  }
}
