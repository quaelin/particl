module.exports = {
  extends: ['eslint-config-airbnb-base'],

  rules: {
    'no-multi-assign': 'off',
    'no-param-reassign': 'warn',
    'no-restricted-syntax': 'warn',
    'object-curly-newline': ['error', { multiline: true }],
    'prefer-rest-params': 'off',
  },
};
