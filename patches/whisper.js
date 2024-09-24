/**
 * This patch creates a small helper method named "whisper" on all command interaction objects.
 */

const { CommandInteraction } = require("discord.js")

module.exports = {
  /**
   * Create the whisper method
   */
  patch() {
    CommandInteraction.prototype.whisper = function (content) {
      this.reply({
        content,
        ephemeral: true,
      })
    }
  },
}
