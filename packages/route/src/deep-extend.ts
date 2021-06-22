export function isPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target: Object, def: Object): Object {
  const clone: any = {};
  Object.keys(def).forEach(function (key) {
    if (target[key] === undefined) {
      clone[key] = def[key];
    } else {
      const tval = target[key];
      const dval = def[key];
      if (isPlainObject(tval) && isPlainObject(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}
export function extendDefault(target: any, def: any): {[key: string]: any} {
  if (!isPlainObject(target)) {
    target = {};
  }
  if (!isPlainObject(def)) {
    def = {};
  }
  return __extendDefault(target, def);
}

// 排除默认参数

function __excludeDefault(data: {[key: string]: any}, def: {[key: string]: any}) {
  const result: any = {};
  let hasSub = false;
  Object.keys(data).forEach((key) => {
    let value = data[key];
    const defaultValue = def[key];
    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && isPlainObject(value)) {
        value = __excludeDefault(value, defaultValue);
      }
      if (value !== undefined) {
        hasSub = true;
        result[key] = value;
      }
    }
  });

  if (hasSub) {
    return result;
  }
  return undefined;
}

// 主要用来排除默认值，keepTopLevel：不能把顶级module省略，否则无法还原
export function excludeDefault(data: any, def: any, keepTopLevel: boolean): {[key: string]: any} {
  if (!isPlainObject(data)) {
    return {};
  }
  if (!isPlainObject(def)) {
    return data;
  }
  const filtered = __excludeDefault(data, def);
  if (keepTopLevel) {
    const result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }
  return filtered || {};
}

function __splitPrivate(data: {[key: string]: any}): [{[key: string]: any} | undefined, {[key: string]: any} | undefined] {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return [undefined, undefined];
  }
  let publicData: {[key: string]: any} | undefined;
  let privateData: {[key: string]: any} | undefined;
  keys.forEach((key) => {
    const value = data[key];
    if (key.startsWith('_')) {
      if (!privateData) {
        privateData = {};
      }
      privateData[key] = value;
    } else if (isPlainObject(value)) {
      const [subPublicData, subPrivateData] = __splitPrivate(value);
      if (subPublicData) {
        if (!publicData) {
          publicData = {};
        }
        publicData[key] = subPublicData;
      }
      if (subPrivateData) {
        if (!privateData) {
          privateData = {};
        }
        privateData[key] = subPrivateData;
      }
    } else {
      if (!publicData) {
        publicData = {};
      }
      publicData[key] = value;
    }
  });
  return [publicData, privateData];
}
// 主要用来分离search与hash，注意：1.不能把顶级module省略，否则无法还原。2.由于服务器只能接收search，所以search不能把顶级module省略
export function splitPrivate(
  data: {[key: string]: any},
  deleteTopLevel: {[key: string]: boolean}
): [{[key: string]: any} | undefined, {[key: string]: any} | undefined] {
  if (!isPlainObject(data)) {
    return [undefined, undefined];
  }
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return [undefined, undefined];
  }
  const result = __splitPrivate(data);
  let publicData = result[0];
  const privateData = result[1];

  keys.forEach(function (key) {
    if (!deleteTopLevel[key]) {
      if (!publicData) {
        publicData = {};
      }
      if (!publicData[key]) {
        publicData[key] = {};
      }
    }
  });
  return [publicData, privateData];
}
