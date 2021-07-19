module.exports = {
  extends: [require.resolve('./common'), 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'react/display-name': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
};
