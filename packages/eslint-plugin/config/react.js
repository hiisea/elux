module.exports = {
  extends: [require.resolve('./common'), 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
};
