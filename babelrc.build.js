const tag = process.env.NODE_TAG || process.env.NODE_ENV;
const cfg = {
  es6: {module: 'esm', targets: {chrome: 70}},
  es5: {module: 'esm', targets: {ie: 11}},
  cjs: {module: 'cjs', targets: {ie: 11}},
  test: {module: 'cjs', targets: {chrome: 70}},
};
const env = cfg[tag];

module.exports = (ui, presets = []) => {
  return {
    presets: [['@elux', {...env, decoratorsLegacy: true, ui, presets, rootImport: {rootPathPrefix: 'src/', rootPathSuffix: './src/'}}]],
    ignore: ['**/*.d.ts'],
    comments: false,
  };
};
