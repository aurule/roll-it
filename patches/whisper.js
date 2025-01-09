/**
 * This patch creates a small helper method named "whisper" on all command interaction objects.
 */

const { CommandInteraction, MessageFlags } = require("discord.js")

module.exports = {
  /**
   * Create the whisper method
   */
  patch(klass) {
    if (!klass) klass = CommandInteraction

    /**
     * Reply with an ephemeral message
     *
     * @param  {str}     content The message contents to send
     * @return {Promise}         Interaction response promise
     */
    klass.prototype.whisper = function (content) {
      return this.reply({
        content,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
