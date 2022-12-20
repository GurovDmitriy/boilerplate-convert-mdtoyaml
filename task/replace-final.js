/* eslint-disable no-undef */
const { src, dest } = require("gulp");
const $ = require("gulp-load-plugins")();

const REGEX_CONTENT_STRIP_SYMB = /content: >-/;
const REGEX_DBL_WRAP_SYMB = /(\n)(\s+\n)(\s+\n)/g;
const RESULT_CONTENT_STRIP_SYMB = "content: |-";

const REGEX_STRIP_SYMB = /(\w+:\s)(>-\n\s+)(.+)(\n)/gm;
const REGEX_QUOTE_SYMB = /((image|subject):\s)(['|"])(.+)(['|"])/g;

module.exports = function replaceFinal() {
  return src("build/**/*.yaml")
    .pipe($.replace(REGEX_CONTENT_STRIP_SYMB, RESULT_CONTENT_STRIP_SYMB))
    .pipe(
      $.replace(REGEX_STRIP_SYMB, function (match, p1, p2, p3, p4) {
        return `${p1}${p3}`;
      })
    )
    .pipe(
      $.replace(REGEX_QUOTE_SYMB, function (match, p1, p2, p3, p4, p5) {
        return `${p1}${p4}`;
      })
    )
    .pipe(
      $.replace(REGEX_DBL_WRAP_SYMB, function (match, p1, p2, p3) {
        return `${p1}${p3}`;
      })
    )
    .pipe(dest("build"));
};
