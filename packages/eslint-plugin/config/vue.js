module.exports = {
  extends: ['plugin:vue/vue3-recommended', require.resolve('./common')],
  overrides: [
    {
      files: ['*.vue'],
      parser: require.resolve('vue-eslint-parser'),
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: '@typescript-eslint/parser',
      },
    },
  ],
};
