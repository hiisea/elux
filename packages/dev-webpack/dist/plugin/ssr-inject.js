"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slash_1 = __importDefault(require("slash"));
const fs_1 = __importDefault(require("fs"));
const unionfs_1 = require("unionfs");
const fs_monkey_1 = require("fs-monkey");
const schema_utils_1 = require("schema-utils");
const schema = {
    type: 'object',
    properties: {
        htmlFilePath: {
            type: 'string',
        },
        entryFilePath: {
            type: 'string',
        },
    },
    additionalProperties: false,
};
const isWin32 = process.platform === 'win32';
class Core {
    constructor(options) {
        this.entryFilePath = '';
        this.htmlKey = 'process.env.ELUX_ENV_SSRTPL';
        this.htmlCode = '';
        this.jsCode = '';
        schema_utils_1.validate(schema, options, { name: '@elux/dev-webpack/ssr-inject' });
        this.htmlFilePath = options.htmlFilePath;
        this.entryFilePath = options.entryFilePath;
    }
    setWebpackFS(webpackFS) {
        this.webpackFS = webpackFS;
    }
    setHtmlCode(htmlCode) {
        this.htmlCode = htmlCode;
        this.replaceCode();
    }
    setJSCode(jsCode) {
        this.jsCode = jsCode;
        this.replaceCode();
    }
    replaceCode() {
        if (this.jsCode && this.htmlCode) {
            const str = this.jsCode.replace(this.htmlKey, this.htmlCode);
            this.webpackFS.writeFileSync(this.entryFilePath, str);
            let mpath = this.entryFilePath;
            if (isWin32) {
                mpath = slash_1.default(this.entryFilePath).replace(/^.+?:\//, '/');
            }
            delete require.cache[mpath];
        }
    }
}
class ServerPlugin {
    constructor(ssrCore) {
        this.ssrCore = ssrCore;
    }
    apply(compiler) {
        compiler.hooks.assetEmitted.tap('SsrInjectServer', (file, { content, source, outputPath, compilation, targetPath }) => {
            this.ssrCore.setWebpackFS(compiler.outputFileSystem);
            if (targetPath === this.ssrCore.entryFilePath) {
                this.ssrCore.setJSCode(content.toString('utf8'));
            }
            if (isWin32) {
                targetPath = slash_1.default(targetPath).replace(/^.+?:\//, '/');
            }
            delete require.cache[targetPath];
            return true;
        });
    }
}
class ClientPlugin {
    constructor(ssrCore) {
        this.ssrCore = ssrCore;
    }
    apply(compiler) {
        compiler.hooks.assetEmitted.tap('SsrInjectClient', (file, { content, source, outputPath, compilation, targetPath }) => {
            if (targetPath === this.ssrCore.htmlFilePath) {
                this.ssrCore.setHtmlCode(content.toString('base64'));
            }
            return true;
        });
    }
}
let sington;
function getSsrInjectPlugin(entryFilePath, htmlFilePath) {
    if (!sington) {
        const core = new Core({ entryFilePath, htmlFilePath });
        const client = new ClientPlugin(core);
        const server = new ServerPlugin(core);
        let devServerFS = null;
        const getEntryPath = function (res) {
            if (!devServerFS) {
                const { outputFileSystem } = res.locals.webpack.devMiddleware;
                unionfs_1.ufs.use(fs_1.default).use(outputFileSystem);
                fs_monkey_1.patchRequire(unionfs_1.ufs, true);
                devServerFS = unionfs_1.ufs;
            }
            return entryFilePath;
        };
        sington = { client, server, getEntryPath };
    }
    return sington;
}
exports.default = getSsrInjectPlugin;
