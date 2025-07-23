/**
 * This patch creates a small helper method named "rollReply" on all command interaction objects.
 */

const { CommandInteraction } = require("discord.js")
const build = require("../util/message-builders")

module.exports = {
  /**
   * Create the rollReply method
   */
  patch(klass) {
    if (!klass) klass = CommandInteraction

    /**
     * Reply with a possibly ephemeral message
     *
     * This is a convenience api that's handy when you know your content will fit within one message. If it
     * might spill into more messages, use paginate instead.
     *
     * @param  {str}     content   The message contents to send
     * @param  {bool}    secret Whether the message is ephemeral or not
     * @return {Promise}           Interaction response promise
     */
    klass.prototype.rollReply = function (content, secret = false) {
      const message = build.textMessage(content, { secret })

      return this.reply(message)
    }
  },
}
