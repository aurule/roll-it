/**
 * This patch creates a small helper method named "whisper" on all command interaction objects.
 */

const {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  Message,
} = require("discord.js")

module.exports = {
  /**
   * Create the whisper method
   */
  patch(target_klass) {
    let klasses = [
      CommandInteraction,
      ModalSubmitInteraction,
      ButtonInteraction,
      UserSelectMenuInteraction,
      Message,
    ]
    if (target_klass) {
      klasses = [target_klass]
    }

    /**
     * Reply with an ephemeral message
     *
     * @param  {str}     content The message contents to send
     * @return {Promise}         Interaction response promise
     */
    const whisper = function (content) {
      return this.reply({
        content,
        flags: MessageFlags.Ephemeral,
      })
    }

    for (const klass of klasses) {
      klass.prototype.whisper = whisper
    }
  },
}
