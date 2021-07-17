"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const deep_extend_1 = __importDefault(require("deep-extend"));
module.exports = function (rootPath, projEnv, port, mockPath) {
    const baseEluxConfig = fs_extra_1.default.existsSync(path_1.default.join(rootPath, 'elux.config.js'))
        ? require(path_1.default.join(rootPath, 'elux.config.js'))
        : {};
    const envPath = baseEluxConfig.dir?.envPath || './env';
    const projEnvPath = path_1.default.resolve(rootPath, envPath, `./${projEnv}`);
    fs_extra_1.default.ensureDirSync(projEnvPath);
    const envEluxConfig = fs_extra_1.default.existsSync(path_1.default.join(projEnvPath, `elux.config.js`))
        ? require(path_1.default.join(projEnvPath, `elux.config.js`))
        : {};
    const defaultBaseConfig = {
        dir: {
            mockPath: './mock',
            envPath: './env',
        },
        mockServer: {
            port: 3003,
        },
    };
    const eluxConfig = deep_extend_1.default(defaultBaseConfig, baseEluxConfig, envEluxConfig);
    return { port: port || eluxConfig.mockServer.port, dir: path_1.default.resolve(rootPath, mockPath || eluxConfig.dir.mockPath) };
};
