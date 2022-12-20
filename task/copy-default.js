const { src, dest } = require("gulp");

module.exports = function copyDefault() {
  return src("src/**/*.*").pipe(dest("build"));
};
