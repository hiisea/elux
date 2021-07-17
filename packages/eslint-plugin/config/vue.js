const common = require('./common');

module.exports = {
  ...common,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ...common.parserOptions,
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  extends: ['plugin:vue/vue3-essential', 'airbnb-typescript', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    ...common.rules,
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'react/destructuring-assignment': 'off',
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
