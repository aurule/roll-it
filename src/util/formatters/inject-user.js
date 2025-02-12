const { userMention } = require("discord.js")

module.exports = {
  /**
   * Replace special placeholder with a user mention string
   *
   * @param  {str} initial   Raw string to format
   * @param  {str} userFlake Discord ID of the user whose reference we are inserting
   * @return {str}           String with the placeholder replaced by a user reference link
   */
  injectMention(initial, userFlake) {
    return initial.replaceAll("{{userMention}}", userMention(userFlake))
  },
}
