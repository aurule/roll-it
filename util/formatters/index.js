/**
 * Module containing helpers for string formatting
 */

const { signed } = require("./signed")
const { indeterminate } = require("./indeterminate")
const { pluralize } = require("./pluralize")
const { capitalize } = require("./capitalize")
const { inlineList } = require("./inline-list")

module.exports = {
  signed,
  indeterminate,
  pluralize,
  capitalize,
  inlineList,
}
