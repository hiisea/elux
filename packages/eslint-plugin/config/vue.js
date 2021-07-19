module.exports = {
  extends: require.resolve('./common'),
  parser: 'vue-eslint-parser',
  parserOptions: {
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
};
