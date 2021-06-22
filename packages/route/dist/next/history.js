import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { routeConfig } from './basic';
export function locationToUri(location, key) {
  const {
    pagename,
    params
  } = location;
  const query = params ? JSON.stringify(params) : '';
  return {
    uri: [key, pagename, query].join('|'),
    pagename,
    query,
    key
  };
}

function isHistoryRecord(data) {
  return data['uri'];
}

function splitUri(...args) {
  const [uri = '', name] = args;
  const [key, pagename, ...others] = uri.split('|');
  const arr = [key, pagename, others.join('|')];
  const index = {
    key: 0,
    pagename: 1,
    query: 2
  };

  if (name) {
    return arr[index[name]];
  }

  return arr;
}

export function uriToLocation(uri) {
  const [key, pagename, query] = splitUri(uri);
  const location = {
    pagename,
    params: JSON.parse(query)
  };
  return {
    key,
    location
  };
}
export class History {
  constructor(data, parent) {
    _defineProperty(this, "curRecord", void 0);

    _defineProperty(this, "pages", []);

    _defineProperty(this, "actions", []);

    this.parent = parent;

    if (isHistoryRecord(data)) {
      this.curRecord = data;
    } else {
      const {
        uri,
        pagename,
        query
      } = locationToUri(data.location, data.key);
      this.curRecord = {
        uri,
        pagename,
        query,
        key: data.key,
        sub: new History({
          uri,
          pagename,
          query,
          key: data.key
        }, this)
      };
    }
  }

  getLength() {
    return this.actions.length;
  }

  getRecord(keyOrIndex) {
    if (typeof keyOrIndex === 'number') {
      if (keyOrIndex === -1) {
        keyOrIndex = this.actions.length - 1;
      }

      return this.actions[keyOrIndex];
    }

    return this.actions.find(item => item.key === keyOrIndex);
  }

  findIndex(key) {
    return this.actions.findIndex(item => item.key === key);
  }

  getCurrentInternalHistory() {
    return this.curRecord.sub;
  }

  getStack() {
    return this.actions;
  }

  getUriStack() {
    return this.actions.map(item => item.uri);
  }

  getPageStack() {
    return this.pages;
  }

  push(location, key) {
    var _pages$;

    const historyRecord = this.curRecord;
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(historyRecord);

    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }

    if (splitUri((_pages$ = pages[0]) == null ? void 0 : _pages$.uri, 'pagename') !== pagename) {
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
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  replace(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  relaunch(location, key) {
    const {
      uri,
      pagename,
      query
    } = locationToUri(location, key);
    this.curRecord = {
      uri,
      pagename,
      query,
      key,
      sub: new History({
        uri,
        pagename,
        query,
        key
      }, this)
    };
    this.actions = [];
    this.pages = [];

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }
  }

  back(delta) {
    var _actions$;

    const historyRecord = this.getRecord(delta - 1);

    if (!historyRecord) {
      return false;
    }

    this.curRecord = historyRecord;
    const {
      uri,
      pagename,
      query
    } = historyRecord;
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, delta);
    const arr = deleteActions.reduce((pre, curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');

      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }

      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri((_actions$ = actions[0]) == null ? void 0 : _actions$.uri, 'pagename')) {
      arr.pop();
    }

    pages.splice(0, arr.length);
    this.actions = actions;
    this.pages = pages;

    if (this.parent) {
      this.parent.curRecord = { ...this.parent.curRecord,
        uri,
        pagename,
        query
      };
    }

    return true;
  }

}