/* eslint-disable no-undef */
const { src, dest, gulp } = require("gulp");
const through2 = require("through2").obj;
const path = require("path");
const $ = require("gulp-load-plugins")();
const File = require("vinyl");

const REGEX_MARKDOWN_IMAGE = /(\!\[(.*?)\])(\((.*?)\))/im;
const REGEX_WRAP_SYM = /(\n){3,}/g;
const REGEX_WRAP_SYM_LAST = /(\n+)$/;
const REGEX_HEADER_LINKS = /^(headerLink)/i;
const REGEX_HEADERS_MARK = /(#+\s(\w+|[а-яА-я]+))/gm;
const REGEX_HEADERS_MARK_FIRST = /(\\\n)/;

// base state

let fileOriginal = {};
let fileResult = {};

let globalState = {
  objOriginal: {},
  objResult: {},
  objTemplate: {
    meta: {
      subject: null,
      header: {
        showHeaderLink: false,
      },
      footer: {
        type: "social-footer",
        socialLinks: ["telegram", "facebook", "youtube", "github"],
        footerLinks: ["docs", "pricing", "services", "support"],
        appLinks: ["google-play", "app-store"],
      },
    },
    blocks: [
      {
        type: "common-card",
        image: null,
        content: "",
      },
    ],
  },
};

const globalStateDefault = cloneObjWithJSON(globalState);

// core
const userPipe =
  (a, b) =>
  (...args) =>
    b(a(...args));

function userPipeRunner(...fns) {
  return fns.reduce(userPipe);
}

// helpers

function cloneObjWithJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// work function

function addTemplateToObjResult(state) {
  state.objResult = cloneObjWithJSON(state.objTemplate);

  return cloneObjWithJSON(state);
}

function replaceSubject(state) {
  state.objResult.meta.subject = state.objOriginal.subject;

  return cloneObjWithJSON(state);
}

function replaceHeader(state) {
  const headerFields = Object.keys(state.objOriginal);
  const headerFieldsFiltered = headerFields.filter((item) => {
    return REGEX_HEADER_LINKS.test(item);
  });

  if (
    headerFieldsFiltered.length &&
    state.objOriginal.showHeaderLink !== false
  ) {
    headerFieldsFiltered.forEach((item) => {
      state.objResult.meta.header[item] = state.objOriginal[item];
    });
    delete state.objResult.meta.header.showHeaderLink;
  }

  return cloneObjWithJSON(state);
}

function replaceImage(state) {
  const content = state.objOriginal.contents;
  const imageURL = content.match(REGEX_MARKDOWN_IMAGE)
    ? content.match(REGEX_MARKDOWN_IMAGE)[4]
    : false;

  if (imageURL) {
    state.objResult.blocks[0].image = imageURL;
  } else {
    delete state.objResult.blocks[0].image;
    state.objResult.blocks[0].type = "text-card";
  }

  return cloneObjWithJSON(state);
}

function replaceContent(state) {
  let content = state.objOriginal.contents;

  content = content.replace(REGEX_MARKDOWN_IMAGE, "");
  content = content.replace(REGEX_WRAP_SYM, "\n\n");
  content = content.replace(REGEX_WRAP_SYM_LAST, "");
  content = content.replace(REGEX_HEADERS_MARK, (match, p1) => `\\\n${p1}`);
  content = content.replace(REGEX_HEADERS_MARK_FIRST, (match, p1) => "");

  state.objResult.blocks[0].content = content;

  return cloneObjWithJSON(state);
}

// Buffer functions
function transformFromBuffer(state) {
  const transformFile = JSON.parse(fileOriginal._contents.toString());
  const objOriginal = transformFile.data[0];
  state.objOriginal = objOriginal;

  return cloneObjWithJSON(state);
}

function transformToBuffer(state) {
  const relativePath = path.relative(process.cwd(), fileOriginal.path);
  const resultPath = relativePath.slice(4);

  const fileResultNew = new File({
    contents: Buffer.from(JSON.stringify(state.objResult)),
    base: process.cwd(),
    path: resultPath,
  });

  fileResult = fileResultNew;

  return cloneObjWithJSON(state);
}

// mutations
function setDefaultState(state, file) {
  state = cloneObjWithJSON(globalStateDefault);
  fileOriginal = file;
  fileResult = {};

  return cloneObjWithJSON(state);
}

function setResult(state) {
  globalState = state;
  return cloneObjWithJSON(globalState);
}

// run
function runGenerate(file) {
  userPipeRunner(
    setDefaultState,
    transformFromBuffer,
    addTemplateToObjResult,
    replaceSubject,
    replaceHeader,
    replaceImage,
    replaceContent,
    transformToBuffer,
    setResult
  )(cloneObjWithJSON(globalState), file);

  return fileResult;
}

module.exports = function generateResult() {
  return src("./dev/**/*.json")
    .pipe(
      through2((file, enc, cb) => {
        cb(null, runGenerate(file));
      })
    )
    .pipe(dest("./generate"));
};
