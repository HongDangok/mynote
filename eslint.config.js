// https://docs.expo.dev/guides/using-eslint/
/*
  Mục đích: Cấu hình ESLint cho dự án Expo.
  - Kế thừa cấu hình từ eslint-config-expo và bỏ qua thư mục dist
*/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
