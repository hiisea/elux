import {Location, routeConfig, RootParams} from './basic';

export function locationToUri(location: Location, key: string): {uri: string; pagename: string; query: string; key: string} {
  const {pagename, params} = location;
  const query = params ? JSON.stringify(params) : '';
  return {uri: [key, pagename, query].join('|'), pagename, query, key};
}

function isHistoryRecord(data: HistoryRecord | {location: Location; key: string}): data is HistoryRecord {
  return data['uri'];
}

function splitUri(uri: string): [string, string, string];
function splitUri(uri: string, name: 'key' | 'pagename' | 'query'): string;
function splitUri(...args: any): [string, string, string] | string {
  const [uri = '', name] = args;
  const [key, pagename, ...others] = uri.split('|');
  const arr = [key, pagename, others.join('|')];
  const index = {key: 0, pagename: 1, query: 2};
  if (name) {
    return arr[index[name]];
  }
  return arr as any;
}
export function uriToLocation<P extends RootParams>(uri: string): {key: string; location: Location<P>} {
  const [key, pagename, query] = splitUri(uri);
  const location: Location = {pagename, params: JSON.parse(query)};
  return {key, location};
}

interface HistoryRecord {
  uri: string;
  pagename: string;
  query: string;
  key: string;
  sub?: History;
}

export class History {
  private curRecord: HistoryRecord;

  private pages: HistoryRecord[] = [];

  private actions: HistoryRecord[] = [];

  constructor(data: HistoryRecord | {location: Location; key: string}, private parent?: History) {
    if (isHistoryRecord(data)) {
      this.curRecord = data;
    } else {
      const {uri, pagename, query} = locationToUri(data.location, data.key);
      this.curRecord = {uri, pagename, query, key: data.key, sub: new History({uri, pagename, query, key: data.key}, this)};
    }
  }

  getLength() {
    return this.actions.length;
  }

  getRecord(keyOrIndex: number | string): HistoryRecord | undefined {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.actions.length - 1;
      }
      return this.actions[keyOrIndex];
    }
    return this.actions.find((item) => item.key === keyOrIndex);
  }

  findIndex(key: string): number {
    return this.actions.findIndex((item) => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.curRecord.sub;
  }

  getStack(): HistoryRecord[] {
    return this.actions;
  }

  getUriStack(): string[] {
    return this.actions.map((item) => item.uri);
  }

  getPageStack(): HistoryRecord[] {
    return this.pages;
  }

  push(location: Location, key: string) {
    const historyRecord = this.curRecord;
    const {uri, pagename, query} = locationToUri(location, key);
    this.curRecord = {uri, pagename, query, key, sub: new History({uri, pagename, query, key}, this)};
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(historyRecord);
    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }
    if (splitUri(pages[0]?.uri, 'pagename') !== pagename) {
      pages.unshift(historyRecord);
      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = historyRecord;
    }
    this.actions = actions;
    this.pages = pages;
    if (this.parent) {
      this.parent.curRecord = {...this.parent.curRecord, uri, pagename, query};
    }
  }

  replace(location: Location, key: string) {
    const {uri, pagename, query} = locationToUri(location, key);
    this.curRecord = {uri, pagename, query, key, sub: new History({uri, pagename, query, key}, this)};
    if (this.parent) {
      this.parent.curRecord = {...this.parent.curRecord, uri, pagename, query};
    }
  }

  relaunch(location: Location, key: string) {
    const {uri, pagename, query} = locationToUri(location, key);
    this.curRecord = {uri, pagename, query, key, sub: new History({uri, pagename, query, key}, this)};
    this.actions = [];
    this.pages = [];
    if (this.parent) {
      this.parent.curRecord = {...this.parent.curRecord, uri, pagename, query};
    }
  }

  // pop(n: number) {
  //   const historyRecord = this.getPageRecord(n);
  //   if (!historyRecord) {
  //     return false;
  //   }
  //   const pages = [...this.pages];
  //   const actions: HistoryRecord[] = [];
  //   pages.splice(0, n);
  //   this.actions = actions;
  //   this.pages = pages;
  //   return true;
  // }

  back(delta: number) {
    const historyRecord = this.getRecord(delta - 1);
    if (!historyRecord) {
      return false;
    }
    this.curRecord = historyRecord;
    const {uri, pagename, query} = historyRecord;
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, delta);
    // 对删除的actions按tag合并
    const arr = deleteActions.reduce((pre: string[], curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');
      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }
      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri(actions[0]?.uri, 'pagename')) {
      arr.pop();
    }
    pages.splice(0, arr.length);
    this.actions = actions;
    this.pages = pages;
    if (this.parent) {
      this.parent.curRecord = {...this.parent.curRecord, uri, pagename, query};
    }
    return true;
  }
}
