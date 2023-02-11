/* eslint-disable */
// @ts-check

/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", ["lower-case", "upper-case"]],
    "header-max-length": [2, "always", 120],
  },
};

module.exports = config;
