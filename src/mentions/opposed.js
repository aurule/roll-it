const { userMention } = require("discord.js")
const { Opposed } = require("../db/opposed")
const { i18n } = require("../locales")
const { cleanup, teamworkTimeout } = require("../interactive/opposed")
const { logger } = require("../util/logger")
const { messageLink } = require("../util/formatters/message-link")
const message_contents = require("../messages/opposed")

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
   * This first handles the special "retry" logic to send the message for the challenge's current state.
   *
   * Otherwise, any message file with a `handleReply` function will have it called with the interaction.
   *
   * @param  {Message} interaction Discord message object
   */
  async handle(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.reference.messageId)

    // if challenge has expired, whisper about that

    const participants = opposed_db.getParticipants(challenge.id)

    if (!participants.some(p => p.user_uid === interaction.user.id)) {
      // whisper they aren't allowed
    }

    if (interaction.content === "retry") {
      const message_data = message_contents.get(challenge.state).data(challenge.id)
      return interaction
        .reply(message_data)
        .then((reply_interaction) => {
          opposed_db.addMessage({
            challenge.id,
            message_uid: reply_interaction.resource.message.id,
          })
        })
        .catch((error) =>
          logger.error(
            {
              err: error,
              challenge_id,
              channel: interaction.channelId,
            },
            `Could not retry message for state "${challenge.state}"`,
          ),
        )
    }

    const state_handler = message_contents.get(challenge.state).handleReply
    if (state_handler !== undefined) {
      return state_handler(interaction)
    }
  },
}
