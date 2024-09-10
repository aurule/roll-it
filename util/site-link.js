const { hyperlink, hideLinkEmbed } = require("discord.js")

const ROOT_URL = "https://aurule.github.io/roll-it/#/"

/**
 * Generate a link to a page on the bot website
 *
 * This link will never include an embedded preview.
 *
 * @param  {str} text       Text of the link
 * @param  {str} partialUrl URL fragment to the page
 * @return {str}            Link code
 */
function siteLink(text, partialUrl) {
  const final_url = (ROOT_URL + partialUrl).replace(/([^:])\/\//, "$1/")
  return hyperlink(text, hideLinkEmbed(final_url))
}

/**
 * Generate a link to the bot website's homepage
 *
 * This link will never include an embedded preview.
 *
 * @param  {str} text Text of the link
 * @return {str}      Link code
 */
function rootLink(text) {
  return hyperlink(text, hideLinkEmbed(ROOT_URL))
}

module.exports = {
  siteLink,
  rootLink,
  ROOT_URL,
}
