import {Location, routeConfig} from './basic';

export class HistoryRecord {
  key: string;
  pagename: string;
  query: string;
  sub: History;
  constructor(location: Location, key: string, history: History) {
    const {pagename, params} = location;
    this.key = key;
    this.pagename = pagename;
    this.query = JSON.stringify(params);
    this.sub = new History(history, this);
    if (history.records.length === 0) {
      history.records = [this];
    }
  }
  getParams(): any {
    return JSON.parse(this.query);
  }
}
export class History {
  public records: HistoryRecord[] = [];

  constructor(private parent?: History, record?: HistoryRecord) {
    if (record) {
      this.records = [record];
    }
  }
  getCurRecord(): HistoryRecord {
    return this.records[0];
  }
  getLength(): Number {
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
  getCurrentSubHistory(): History {
    return this.getCurRecord().sub;
  }
  getStack(): HistoryRecord[] {
    return [...this.records];
  }
  push(location: Location, key: string): void {
    const newRecord = new HistoryRecord(location, key, this);
    const maxHistory = routeConfig.maxHistory;
    const records = this.records;
    records.unshift(newRecord);
    if (records.length > maxHistory) {
      records.length = maxHistory;
    }
  }
  replace(location: Location, key: string): void {
    const newRecord = new HistoryRecord(location, key, this);
    this.records[0] = newRecord;
  }
  relaunch(location: Location, key: string): void {
    const newRecord = new HistoryRecord(location, key, this);
    this.records = [newRecord];
  }
  back(delta: number, overflowRedirect = false): HistoryRecord | undefined {
    const records = this.records.slice(delta);
    if (records.length === 0) {
      if (overflowRedirect) {
        return undefined;
      } else {
        records.push(this.records.pop()!);
      }
    }
    this.records = records;
    return this.records[0];
  }
}
