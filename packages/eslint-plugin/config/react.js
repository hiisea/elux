const common = require('./common');

module.exports = {
  ...common,
  extends: ['airbnb-typescript', 'airbnb/hooks', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    ...common.rules,
    'react/prop-types': 'off',
    'react/state-in-constructor': 'off',
    'react/destructuring-assignment': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/static-property-placement': 'off',
    'react/sort-comp': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/interactive-supports-focus': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
};
