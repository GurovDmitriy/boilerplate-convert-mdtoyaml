const { src, dest } = require("gulp");
const $ = require("gulp-load-plugins")();

module.exports = function replacer() {
  const REGEX_USE_MARKDOWN = /(\.use\(markdown\(\)\))/m;

  return src("./node_modules/markdown-json/lib/generator.js")
    .pipe(
      $.replace(REGEX_USE_MARKDOWN, (match, p1) =>
        match.replace(p1, `// ${p1}`)
      )
    )
    .pipe(dest("./node_modules/markdown-json/lib/"));
};
