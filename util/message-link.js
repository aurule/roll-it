const { messageLink, hideLinkEmbed } = require('discord.js')

function smartMessageLink(message, embed = true) {
    const raw_link = messageLink(message.channelId, message.id, message.guildId)
    if (embed) {
        return raw_link
    }
    return hideLinkEmbed(raw_link)
}

module.exports = {
    messageLink: smartMessageLink
}
