module.exports = {
  root: true,
  extends: ['plugin:@elux/react'],
  env: {
    browser: false,
    node: false,
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['/.eslintrc.js'],
};
