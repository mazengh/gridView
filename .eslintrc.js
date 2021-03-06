// .eslintrc.js
module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  // extends: "standard",
  extends: ["standard", "plugin:prettier/recommended"],
  // required to lint *.vue files
  plugins: ["html"],
  // add your custom rules here
  rules: {
    semi: "error",
  },
  globals: {},
};
