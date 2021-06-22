const common = require('./common');

module.exports = {
  ...common,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ...common.parserOptions,
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  extends: ['airbnb-typescript', 'plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    ...common.rules,
    'vue/require-default-prop': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
