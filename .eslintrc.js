const path = require('path');

module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals'],
  plugins: ['next-rules', 'custom-rules'],
  rules: {
    'next-rules/no-metadata-themeColor-viewport': 'warn',
    'custom-rules/no-inline-metadata-themeColor-viewport': 'error',
  },
  overrides: [
    {
      files: ['app/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'custom-rules/no-inline-metadata-themeColor-viewport': 'error',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
