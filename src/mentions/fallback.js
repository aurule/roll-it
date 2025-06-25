const { randomInt } = require("mathjs")

const { i18n } = require("../locales")

/**
 * Fallback message mention handler
 */

module.exports = {
  /**
   * Determine whether this mention handler can handle a given message
   *
   * Since this is the fallback handler, this always returns true
   *
   * @param  {Message} _message The message to test. Ignored.
   * @return {boolean}          Always returns true
   */
  canHandle(_message) {
    return true
  },

  /**
   * Handle a message
   *
   * @param  {Message} message Message to handle
   * @return {Promise}         Promise resolving to a Message or Emoji response
   */
  async handle(message) {
    if (message.author.id === process.env.CLIENT_ID) return

    if (message.mentions.users.size > 1) {
      return message.react("<:rolliteye:1362168653348470975>")
    }

    const messages = i18n.t("easter-eggs.mention.messages", { returnObjects: true })
    const content = messages.at(randomInt(messages.length))

    return message.reply(content)
  },
}
