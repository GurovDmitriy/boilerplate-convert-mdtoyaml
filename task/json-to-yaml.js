/* eslint-disable no-undef */
const { src, dest } = require("gulp");
const $ = require("gulp-load-plugins")();

module.exports = function jsonToYaml() {
  return src("generate/**/*.json").pipe($.jsonToYaml()).pipe(dest("build"));
};
