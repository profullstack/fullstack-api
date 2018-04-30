module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-param-reassign': ['error', { 'props': false }],
    'no-useless-constructor': 'off',
    'class-methods-use-this': 'off',
    'import/no-dynamic-require': 'off',
    'consistent-return': 'off',
    'arrow-body-style': 'off'
  }
};

