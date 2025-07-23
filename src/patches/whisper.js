/**
 * This patch creates a small helper method named "whisper" on all interaction objects.
 */

const {
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} = require("discord.js")

const build = require("../util/message-builders")

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
      StringSelectMenuInteraction,
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
      const message = build.textMessage(content, { secret: true })
      return this.reply(message)
    }

    for (const klass of klasses) {
      klass.prototype.whisper = whisper
    }
  },
}
