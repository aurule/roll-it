const { userMention } = require("discord.js")
const { Opposed } = require("../db/opposed")
const { i18n, available_locales } = require("../locales")
const { logger } = require("../util/logger")
const message_contents = require("../messages/opposed")

const RETRY_KEYWORDS = available_locales.map(locale => i18n.t("opposed.retry", { lng: locale, ns: "interactive" }))

module.exports = {
  /**
   * Get whether this handler accepts a certain message
   *
   * To be handled, a message must appear in the opposed messages database.
   *
   * @param  {Message} interaction Discord message object
   * @return {boolean}             True if the message can be handled, false if not
   */
  canHandle(interaction) {
    const opposed_db = new Opposed()
    return opposed_db.hasMessage(interaction.reference?.messageId)
  },

  /**
   * Handle a message
   *
   * This first handles the special "retry" logic to send the message for the challenge's current state. It
   * will call an `afterReply` hook if present on the message.
   *
   * Otherwise, any message file with a `handleReply` function will have it called with the interaction.
   *
   * @param  {Message} interaction Discord message object
   */
  async handle(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.reference.messageId)

    if (RETRY_KEYWORDS.includes(interaction.content)) {
      const message_file = message_contents.get(challenge.state)
      const message_data = message_file.data(challenge.id)
      const afterRetry = message_file.afterRetry
      return interaction
        .ensure("reply", message_data, {
          challenge_id: challenge.id,
          channel_id: interaction.channelId,
          detail: `failed to retry message for state "${challenge.state}"`,
        })
        .then((reply_interaction) => {
          const message_props = {
            challenge_id: challenge.id,
            message_uid: reply_interaction.id,
            test_id: opposed_db.findTestByMessage(interaction.reference.messageId)?.id ?? null,
          }
          opposed_db.addMessage(message_props)
          if (afterRetry !== undefined) {
            afterRetry(reply_interaction)
          }
        })
    }

    const state_handler = message_contents.get(challenge.state).handleReply
    if (state_handler !== undefined) {
      try {
        return state_handler(interaction)
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logger.info({
            user: interaction.user,
            component: component_name,
            detail: "unauthorized component interaction",
          })
          return interaction.ensure(
            "whisper",
            i18n.t("opposed.unauthorized", {
              ns: "interactive",
              lng: interaction.locale,
              context: "mention",
              participants: err.allowed_uids.map(userMention),
            }),
            {
              user: interaction.user,
              message: interaction.message,
            },
          )
        } else {
          logger.error({
            err,
            user: interaction.user,
            component: component_name,
          })
        }
      }
    }
  },
}
