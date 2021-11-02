/* eslint-disable no-console */
import chalk from 'chalk';
import semver from 'semver';
import minimist from 'minimist';
import fs from 'fs-extra';
import deepExtend from 'deep-extend';
import {networkInterfaces} from 'os';

function getLocalIP() {
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

const localIP = getLocalIP();

function slash(path: string): string {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

function log(message: string): void {
  console.log(message);
}

function err(message: string): void {
  console.error(message);
}

export = {chalk, semver, deepExtend, slash, minimist, fs, localIP, log, err};
