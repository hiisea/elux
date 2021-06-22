module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  plugins: ['stylelint-prettier', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
    'no-descending-specificity': null,
    'unit-case': null,
    'font-family-no-missing-generic-family-keyword': null,
  },
};
