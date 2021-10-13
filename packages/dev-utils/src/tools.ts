import {networkInterfaces} from 'os';

export function getLocalIP(): string {
  let result = 'localhost';
  const interfaces = networkInterfaces();
  for (const devName in interfaces) {
    const isEnd = interfaces[devName]?.some((item) => {
      // 取IPv4, 不为127.0.0.1的内网ip
      if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal) {
        result = item.address;
        return true;
      }
      return false;
    });
    // 若获取到ip, 结束遍历
    if (isEnd) {
      break;
    }
  }
  return result;
}

export function getCssScopedName(srcPath: string, localName: string, mfileName: string): string {
  if (mfileName.match(/[/\\]global.module.\w+?$/)) {
    return `g-${localName}`;
  }
  mfileName = mfileName
    .replace(/^.*[/\\]node_modules[/\\]/, 'modules/')
    .replace(/^@.+?[/\\]/, '')
    .replace(srcPath, '')
    .replace(/\W/g, '-')
    .replace(/^-|-index-module-\w+$|-module-\w+$|-index-vue$|-vue$/g, '')
    .replace(/^components-/, 'comp-')
    .replace(/^modules-.*?(\w+)-views(-?)(.*)/, '$1$2$3')
    .replace(/^modules-.*?(\w+)-components(-?)(.*)/, '$1-comp$2$3');
  return localName === 'root' ? mfileName : `${mfileName}_${localName}`;
}
