import path from 'path';
import slash from 'slash';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import fs from 'fs';
import webpack, {Compiler} from 'webpack';
import {ufs} from 'unionfs';

import {patchRequire} from 'fs-monkey';

import {validate} from 'schema-utils';

const schema: any = {
  type: 'object',
  properties: {
    entryFileName: {
      type: 'string',
    },
  },
  additionalProperties: false,
};

function replace(source: string, htmlKey: string, html: string) {
  return source.replace(htmlKey, html);
}

interface Options {
  entryFileName: string;
}

const isWin32 = process.platform === 'win32';

export class SsrInject {
  entryFileName: string;

  entryFilePath: string = '';

  htmlKey: string = 'process.env.ELUX_ENV_SSRTPL';

  html: string = '';

  outputFileSystem: any;

  constructor(options: Options) {
    validate(schema, options, {name: '@elux/dev-webpack/ssr-inject'});
    this.entryFileName = options.entryFileName;
  }

  apply(compiler: Compiler) {
    const htmlKey = this.htmlKey;
    if (compiler.options.name === 'server') {
      const entryFileName = this.entryFileName;
      const outputPath: string = compiler.options.output.path as string;
      this.entryFilePath = path.join(outputPath, entryFileName);
      compiler.hooks.compilation.tap('SsrInject', (compilation) => {
        compilation.hooks.afterProcessAssets.tap('SsrInjectReplace', (assets) => {
          const html = this.html;
          if (assets[entryFileName] && html) {
            compilation.updateAsset(entryFileName, (source) => {
              return new webpack.sources.RawSource(replace(source.source().toString(), htmlKey, html), false);
            });
          }
        });
      });
      compiler.hooks.emit.tapAsync('SsrInjectDeleteCache', (compilation, callback) => {
        const hotJsonFile = Object.keys(compilation.assets).find((name) => name.endsWith('.hot-update.json'));
        if (hotJsonFile) {
          const manifest = JSON.parse(compilation.assets[hotJsonFile].source().toString());
          const keys = [...manifest.c, ...manifest.r, ...manifest.m];
          keys.forEach((item) => {
            let mpath = path.join(outputPath, `${item}.js`);
            if (isWin32) {
              mpath = slash(mpath).replace(/^.+?:\//, '/');
            }
            delete require.cache[mpath];
          });
        }
        callback();
      });
    } else {
      compiler.hooks.compilation.tap('SsrInject', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('SsrInjectSetHtml', (data, callback) => {
          const outputFileSystem = compiler.outputFileSystem as any;
          const html = Buffer.from(data.html).toString('base64');
          const rawHtml = this.html || htmlKey;
          this.html = html;
          const entryFilePath = this.entryFilePath;
          if (outputFileSystem.existsSync(entryFilePath)) {
            const source: string = outputFileSystem.readFileSync(entryFilePath).toString();
            outputFileSystem.writeFileSync(entryFilePath, replace(source, rawHtml, html));
            let mpath = entryFilePath;
            if (isWin32) {
              mpath = slash(mpath).replace(/^.+?:\//, '/');
            }
            delete require.cache[mpath];
          }
          callback(null, data);
        });
      });
    }
  }

  getEntryPath(res: any) {
    // const {outputFileSystem, stats} = res.locals.webpack.devMiddleware;
    // const compilerArr = devMiddleware.compiler.compilers;
    // const statsArr = stats.toJson().children;
    // const {assetsByChunkName, assets, chunks, outputPath} = statsArr[1];
    // const mainPath = path.join(outputPath, 'main.js');
    if (!this.outputFileSystem) {
      const {outputFileSystem} = res.locals.webpack.devMiddleware;
      ufs.use(fs).use(outputFileSystem);
      patchRequire(ufs, true);

      this.outputFileSystem = ufs;
    }
    return this.entryFilePath;
  }
}

let instance: SsrInject | null = null;

export function getSsrInjectPlugin(entryFileName: string = 'main.js') {
  if (!instance) {
    instance = new SsrInject({entryFileName});
  }
  return instance;
}
