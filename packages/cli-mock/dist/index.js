"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const cli_utils_1 = require("@elux/cli-utils");
function genMockConfig(rootPath, projEnv, port, mockPath) {
    const baseEluxConfig = cli_utils_1.fs.existsSync(path_1.default.join(rootPath, 'elux.config.js'))
        ? require(path_1.default.join(rootPath, 'elux.config.js'))
        : {};
    const envPath = baseEluxConfig.dir?.envPath || './env';
    const projEnvPath = path_1.default.resolve(rootPath, envPath, `./${projEnv}`);
    cli_utils_1.fs.ensureDirSync(projEnvPath);
    const envEluxConfig = cli_utils_1.fs.existsSync(path_1.default.join(projEnvPath, `elux.config.js`))
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
    const eluxConfig = cli_utils_1.deepExtend(defaultBaseConfig, baseEluxConfig, envEluxConfig);
    return { port: port || eluxConfig.mockServer.port, dir: path_1.default.resolve(rootPath, mockPath || eluxConfig.dir.mockPath) };
}
module.exports = function (projectPath, env, options) {
    const { port, dir } = genMockConfig(projectPath, env, options.port, options.dir);
    const src = path_1.default.join(dir, './src');
    const tsconfig = path_1.default.join(dir, './tsconfig.json');
    const start = path_1.default.join(__dirname, './mock.js');
    let cmd = '';
    if (options.watch) {
        cmd = `nodemon -e ts,js,json -w ${src} --exec ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
    }
    else {
        cmd = `ts-node --project ${tsconfig} -r tsconfig-paths/register ${start}`;
    }
    process.env.SRC = src;
    process.env.PORT = port + '';
    child_process_1.spawn(cmd, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
};
