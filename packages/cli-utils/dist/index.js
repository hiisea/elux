"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const minimist_1 = __importDefault(require("minimist"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const os_1 = require("os");
function getLocalIP() {
    let result = 'localhost';
    const interfaces = os_1.networkInterfaces();
    for (const devName in interfaces) {
        const isEnd = interfaces[devName]?.some((item) => {
            if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal) {
                result = item.address;
                return true;
            }
            return false;
        });
        if (isEnd) {
            break;
        }
    }
    return result;
}
const localIP = getLocalIP();
function slash(path) {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
    if (isExtendedLengthPath || hasNonAscii) {
        return path;
    }
    return path.replace(/\\/g, '/');
}
function log(message) {
    console.log(message);
}
function err(message) {
    console.error(message);
}
module.exports = { chalk: chalk_1.default, semver: semver_1.default, deepExtend: deep_extend_1.default, slash, minimist: minimist_1.default, fs: fs_extra_1.default, localIP, log, err };
