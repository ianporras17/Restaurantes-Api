import eslintPluginImport from 'eslint-plugin-import';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      import: eslintPluginImport
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'import/order': ['warn', { groups: [['builtin', 'external', 'internal']] }]
    }
  }
];
