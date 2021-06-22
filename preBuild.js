const replace = require('replace-in-file');
const runtimeVersion = require('@babel/runtime/package.json').version;

const options = {
  files: './package.json',
  from: /"@babel\/runtime":\s?"([^"]+)"/g,
  to: `"@babel/runtime": "~${runtimeVersion}"`,
  countMatches: true,
};
// @ts-ignore
replace.sync(options);
