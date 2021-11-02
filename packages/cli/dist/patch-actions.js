"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const typescript_json_schema_1 = __importDefault(require("typescript-json-schema"));
const cli_utils_1 = require("@elux/cli-utils");
module.exports = function moduleExports(_tsconfig, _entryFilePath, _echo) {
    const rootPath = process.cwd();
    const srcPath = path_1.default.join(rootPath, 'src');
    let tsconfig;
    if (!_tsconfig) {
        if (fs_1.default.existsSync(path_1.default.join(srcPath, './tsconfig.json'))) {
            tsconfig = require(path_1.default.join(srcPath, './tsconfig.json'));
            process.chdir('./src');
        }
        else {
            tsconfig = require(path_1.default.join(rootPath, './tsconfig.json'));
        }
    }
    else if (typeof _tsconfig === 'string') {
        tsconfig = require(_tsconfig);
    }
    else {
        tsconfig = _tsconfig;
    }
    const entryFilePath = _entryFilePath || (fs_1.default.existsSync(path_1.default.join(srcPath, 'Global.ts')) ? path_1.default.join(srcPath, 'Global.ts') : path_1.default.join(srcPath, 'Global.tsx'));
    const source = fs_1.default.readFileSync(entryFilePath).toString();
    const arr = source.match(/patchActions\s*\(([^)]+)\)/m);
    if (arr) {
        const [args1, ...args2] = arr[1].split(',');
        const typeName = args1.trim();
        const json = args2.join(',').trim();
        const files = [entryFilePath];
        cli_utils_1.log(`patchActions using type ${cli_utils_1.chalk.magenta(`${typeName.substr(1, typeName.length - 2)}`)} for ${cli_utils_1.chalk.underline(entryFilePath)}`);
        const program = typescript_json_schema_1.default.getProgramFromFiles(files, { ...tsconfig.compilerOptions, composite: false, sourceMap: false });
        const defineType = typescript_json_schema_1.default.generateSchema(program, typeName.substr(1, typeName.length - 2), { ignoreErrors: false });
        const properties = defineType.properties;
        const actions = Object.keys(properties).reduce((obj, key) => {
            obj[key] = properties[key].enum;
            return obj;
        }, {});
        const json2 = `'${JSON.stringify(actions)}'`;
        if (_echo) {
            cli_utils_1.log(`\n${cli_utils_1.chalk.green(JSON.stringify(actions, null, 4))}\n`);
        }
        else if (json !== json2) {
            const newSource = source.replace(arr[0], `patchActions(${typeName}, ${json2})`);
            fs_1.default.writeFileSync(entryFilePath, newSource);
            cli_utils_1.log(`${cli_utils_1.chalk.underline(entryFilePath)} has been patched!`);
        }
        else {
            cli_utils_1.log('There was no change!');
        }
    }
};
