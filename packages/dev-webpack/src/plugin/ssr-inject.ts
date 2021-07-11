import slash from 'slash';

import fs from 'fs';
import {Compiler} from 'webpack';
import {ufs} from 'unionfs';

import {patchRequire} from 'fs-monkey';

import {validate} from 'schema-utils';

const schema: any = {
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

interface Options {
  htmlFilePath: string;
  entryFilePath: string;
}

const isWin32 = process.platform === 'win32';

class Core {
  readonly htmlFilePath: string;

  readonly entryFilePath: string = '';

  readonly htmlKey: string = 'process.env.ELUX_ENV_SSRTPL';

  private htmlCode: string = '';

  private jsCode: string = '';

  private webpackFS: any;

  constructor(options: Options) {
    validate(schema, options, {name: '@elux/dev-webpack/ssr-inject'});
    this.htmlFilePath = options.htmlFilePath;
    this.entryFilePath = options.entryFilePath;
  }

  setWebpackFS(webpackFS: any) {
    this.webpackFS = webpackFS;
  }

  setHtmlCode(htmlCode: string) {
    this.htmlCode = htmlCode;
    this.replaceCode();
  }

  setJSCode(jsCode: string) {
    this.jsCode = jsCode;
    this.replaceCode();
  }

  replaceCode() {
    if (this.jsCode && this.htmlCode) {
      const str = this.jsCode.replace(this.htmlKey, this.htmlCode);
      this.webpackFS.writeFileSync(this.entryFilePath, str);
      let mpath = this.entryFilePath;
      if (isWin32) {
        mpath = slash(this.entryFilePath).replace(/^.+?:\//, '/');
      }
      delete require.cache[mpath];
    }
  }
}

class ServerPlugin {
  constructor(public ssrCore: Core) {}

  apply(compiler: Compiler) {
    compiler.hooks.assetEmitted.tap('SsrInjectServer', (file, {content, source, outputPath, compilation, targetPath}) => {
      this.ssrCore.setWebpackFS(compiler.outputFileSystem);
      if (targetPath === this.ssrCore.entryFilePath) {
        this.ssrCore.setJSCode(content.toString('utf8'));
      }
      if (isWin32) {
        targetPath = slash(targetPath).replace(/^.+?:\//, '/');
      }
      delete require.cache[targetPath];
      return true;
    });
  }
}

class ClientPlugin {
  constructor(public ssrCore: Core) {}

  apply(compiler: Compiler) {
    compiler.hooks.assetEmitted.tap('SsrInjectClient', (file, {content, source, outputPath, compilation, targetPath}) => {
      if (targetPath === this.ssrCore.htmlFilePath) {
        this.ssrCore.setHtmlCode(content.toString('base64'));
      }
      return true;
    });
  }
}

let sington: {client: ClientPlugin; server: ServerPlugin; getEntryPath: (res: any) => string} | undefined;

export default function getSsrInjectPlugin(entryFilePath: string, htmlFilePath: string) {
  if (!sington) {
    const core = new Core({entryFilePath, htmlFilePath});
    const client = new ClientPlugin(core);
    const server = new ServerPlugin(core);
    let devServerFS: any = null;
    const getEntryPath = function (res: any) {
      // const {outputFileSystem, stats} = res.locals.webpack.devMiddleware;
      // const compilerArr = devMiddleware.compiler.compilers;
      // const statsArr = stats.toJson().children;
      // const {assetsByChunkName, assets, chunks, outputPath} = statsArr[1];
      // const mainPath = path.join(outputPath, 'main.js');
      if (!devServerFS) {
        const {outputFileSystem} = res.locals.webpack.devMiddleware;
        ufs.use(fs).use(outputFileSystem);
        patchRequire(ufs, true);

        devServerFS = ufs;
      }
      return entryFilePath;
    };
    sington = {client, server, getEntryPath};
  }
  return sington;
}
