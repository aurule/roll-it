/**
 * This patch creates a helper method named "ensure" on all interaction objects.
 */

const api = require("../services/api")
const logger = require("../util/logger")

const {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} = require("discord.js")

module.exports = {
  /**
   * Create the ensure method
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
     * Try to ensure that a particular message will be sent
     *
     * This catches the most common errors thrown by discord which prevent a message from being sent. Then,
     * it tries to send the message by itself to the interaction's channel. If that fails, an error will be
     * logged and the message effectively cannot be sent.
     *
     * All other errors will not be retried, as they may be made worse by trying to send a new message
     *
     * @param  {string} funktion The name of the interaction function to call
     * @param  {obj}    args     Object of arguments for the function
     * @param  {obj}    context  Object of additional data to include in any warning or error logs
     * @return {Promise}         Promise resolving to a message
     */
    const ensure = async function (funktion, args, context = {}) {
      return this[funktion](args)
        .catch(err => {
          if (err.code === 10062) {
            logger.warn(
              {
                ...context,
                err,
                fn: funktion,
                args,
              },
              `Got "Unknown interaction" error for "${funktion}". Sending as detached message.`
            )
            return api
              .sendMessage(this.channel.id, args)
              .catch(err => logger.error(
                {
                  ...context,
                  err,
                  fn: funktion,
                  args,
                  channel: this.channel,
                },
                `Unable to send detached message for "${funktion}".`
              ))
          }
        })
    }

    for (const klass of klasses) {
      klass.prototype.ensure = ensure
    }
  },
}
