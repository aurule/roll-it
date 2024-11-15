/**
 * Module containing helpers for string formatting
 */

const { signed } = require("./signed")
const { indeterminate } = require("./indeterminate")
const { pluralize } = require("./pluralize")
const { capitalize } = require("./capitalize")
const { inlineList } = require("./inline-list")
const { siteLink, rootLink } = require("./site-link")
const { messageLink } = require("./message-link")
const { injectMention } = require("./inject-user")

module.exports = {
  signed,
  indeterminate,
  pluralize,
  capitalize,
  inlineList,
  siteLink,
  rootLink,
  messageLink,
  injectMention,
}
