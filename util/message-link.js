const { messageLink, hideLinkEmbed } = require("discord.js")

/**
 * Generate a link to a specific message
 *
 * @param  {Message} message Discord.js message object
 * @param  {Boolean} embed   Whether to show an embedded preview
 * @return {str}             String with a correctly formatted link to the message
 */
function smartMessageLink(message, embed = true) {
  const raw_link = messageLink(message.channelId, message.id, message.guildId)
  if (embed) {
    return raw_link
  }
  return hideLinkEmbed(raw_link)
}

module.exports = {
  messageLink: smartMessageLink,
}
