const { userMention } = require("discord.js")
const { Teamwork, MessageType } = require("../db/interactive")
const { i18n } = require("../locales")
const teamwork_change = require("../embeds/teamwork-change")
const { cleanup, teamworkTimeout } = require("../interactive/teamwork")
const { logger } = require("../util/logger")
const { messageLink } = require("../util/formatters/message-link")

module.exports = {
  /**
   * Get whether this handler accepts a certain message
   *
   * To be handled, a message must appear in the teamwork messages database.
   *
   * @param  {Message} interaction Discord message object
   * @return {boolean}             True if the message can be handled, false if not
   */
  canHandle(interaction) {
    const teamwork_db = new Teamwork()
    return teamwork_db.hasMessage(interaction.reference?.messageId)
  },
  /**
   * Handle a message
   *
   * This ensures that the message is tied to an active teamwork test, then adds or updates the message user's
   * helper record and shows a new summary of the test.
   *
   * @param  {Message} interaction Discord message object
   */
  async handle(interaction) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.findTestByMessage(interaction.reference.messageId)

    if (test === undefined) {
      const t = i18n.getFixedT(interaction.locale, "interactive", "teamwork")
      return interaction.whisper(t("concluded")).catch((error) =>
        logger.warn(
          {
            err: error,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
          },
          "Could not whisper about unknown test",
        ),
      )
    }

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")

    if (test.expired) {
      await teamworkTimeout(test.id)
      return interaction.whisper(t("concluded")).catch((error) =>
        logger.warn(
          {
            err: error,
            test: test.id,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
          },
          "Could not whisper about expired test",
        ),
      )
    }

    const dice_content = interaction.content
    const clumped = dice_content.replace(/\s/, "")
    const match = dice_content.match(/-?\d/)
    if (match === null) {
      return interaction.whisper(t("help_given.missing")).catch((error) =>
        logger.error(
          {
            err: error,
            test: test.id,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
            content: dice_content,
          },
          "Could not whisper about missing number",
        ),
      )
    }

    const num = parseInt(match[0])
    if (num === NaN) {
      return interaction.whisper(t("help_given.invalid")).catch((error) =>
        logger.error(
          {
            err: error,
            test: test.id,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
            content: dice_content,
          },
          "Could not whisper about invalid number",
        ),
      )
    }

    const author_id = interaction.author.id
    teamwork_db.setDice(test.id, author_id, num)

    const prompt_link = messageLink({
      id: teamwork_db.getPromptUid(test.id),
      channelId: test.channel_uid,
      guildId: interaction.guildId,
    })
    const t_args = {
      helper: userMention(author_id),
      count: num,
      context: author_id === test.leader ? "leader" : "helper",
      prompt_link,
    }

    const embed = teamwork_change.data(test)
    return interaction
      .reply({
        content: t("help_given.success", t_args),
        embeds: [embed],
        allowedMentions: {
          users: [author_id],
        },
        withResponse: true,
      })
      .then((reply_interaction) => {
        teamwork_db.addMessage({
          teamwork_id: test.id,
          message_uid: reply_interaction.resource.message.id,
          type: MessageType.Plain,
        })
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            test: test.id,
            reply_to: interaction.reference.messageId,
            message: interaction.id,
          },
          "Could not reply with added dice",
        ),
      )
  },
}
