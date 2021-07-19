const tsconfig = require('./tsconfig.json');

module.exports = {
  root: true,
  extends: ['plugin:@elux/common'],
  env: {
    browser: false,
    node: true,
  },
  rules: {},
  ignorePatterns: tsconfig.exclude,
};
