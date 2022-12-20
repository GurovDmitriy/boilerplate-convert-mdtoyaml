/* eslint-disable no-undef */
const { src, dest, gulp } = require("gulp");
const through2 = require("through2").obj;
const markdownJson = require("markdown-json");
const path = require("path");
const $ = require("gulp-load-plugins")();

function mdParser({ inputStr, outputStr, outputName, cb }) {
  const settings = {
    name: "markdown-json",
    cwd: "./",
    src: `src/`,
    filePattern: inputStr,
    ignore: "*(icon|input)*",
    dist: `dev/${outputStr}${outputName}.json`,
    metadata: false,
    server: false,
    port: 3001,
    deterministicOrder: false,
  };

  markdownJson(settings)
    .then((data) => {
      console.log("file parse...");
      cb();
    })
    .catch((err) => {
      console.log("error:", err);
    });
}

module.exports = function mdToJSON(cb) {
  return src("./src/**/{*,}/", { base: "./src" }).pipe(
    $.flatmap((stream, dir) =>
      src(`${dir.path}/mail/*.md`).pipe(
        through2((file, enc, cb) => {
          const str = path.relative(dir.base, file.path);
          const inputStr = str.replace(/\\/g, "/");
          const outputStr = inputStr.replace(/(ru|en)\.md$/, "");
          const outputName = inputStr.slice(
            inputStr.search(/(ru|en)\.md$/),
            inputStr.length - 3
          );
          mdParser({ inputStr, outputStr, outputName, cb });
          // cb();
        })
      )
    )
  );
};
