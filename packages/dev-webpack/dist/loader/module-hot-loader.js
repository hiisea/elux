"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const moduleIndexFile = path_1.default.normalize('/src/modules');
module.exports = function loader(source) {
    const filePath = this.resourcePath;
    const fileName = path_1.default.basename(filePath).split('.')[0];
    if (filePath.indexOf(moduleIndexFile) > -1 && fileName === 'index') {
        const arr = source.match(/exportModule\s*\(([^)]+)\)/m);
        const elux = source.match(/['"](@elux\/.+?)['"]/);
        if (arr && elux) {
            const args = arr[1].replace(/\s/gm, '');
            const [modelName, ModelHandlers] = args.split(',', 3);
            const strs = [
                `import {modelHotReplacement} from ${elux[0]};`,
                source,
                `if (module.hot) {
        module.hot.accept("./model", () => {
          modelHotReplacement(${[modelName, ModelHandlers].join(' , ')});
        });
        }`,
            ];
            return strs.join('\r\n');
        }
    }
    return source;
};
