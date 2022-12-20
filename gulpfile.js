const gulp = require("gulp");

const jsonToYaml = require("./task/json-to-yaml.js");
const mdToJSON = require("./task/md-to-json.js");
const prepare = require("./task/prepare.js");
const generateResult = require("./task/generate-config.js");
const replaceFinal = require("./task/replace-final.js");
const copyDefault = require("./task/copy-default.js");

exports.toyaml = gulp.series(jsonToYaml);
exports.tojson = gulp.series(mdToJSON);
exports.prepare = gulp.series(prepare);
exports.replace = gulp.series(replaceFinal);
exports.generate = gulp.series(generateResult);
exports.copyDefault = gulp.series(copyDefault);
