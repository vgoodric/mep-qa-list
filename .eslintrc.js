'use strict';
// eslint-disable-next-line no-undef
module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'script',
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  plugins: ['eslint-plugin-html'],
  extends: ['eslint:recommended'],
  rules: {
    'strict': ['error', 'global'],
    'no-redeclare': ['error', { builtinGlobals: true }], //The "builtinGlobals" option will check for redeclaration of built-in globals in global scope.
    'dot-notation': 'error',
    'no-confusing-arrow': 'error',
    'camelcase': 'error',
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'quote-props': ['error', 'consistent-as-needed'],
    'no-invalid-this': 'error',
    'consistent-this': ['error', 'app'],
    'eqeqeq': ['error', 'always'],
    'no-multi-assign': 'error',
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'yoda': 'error',
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'error',
    'no-restricted-syntax': [
      'error',
      {
        message: "Please don't use HTML keyword for your property name. It is reserved to be used by compiler!",
        selector: 'Property > Identifier[name="html"]',
      },
    ],
    //'no-shadow': ['error', { "builtinGlobals": true }],
  },
};
