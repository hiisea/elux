module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-rational-order', 'stylelint-prettier/recommended'],
  customSyntax: 'postcss-less',
  plugins: ['stylelint-prettier', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'color-function-notation': 'legacy',
    'alpha-value-notation': 'number',
    'no-descending-specificity': null,
    'no-invalid-position-at-import-rule': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
  },
};
