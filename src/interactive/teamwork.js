const { ActionRowBuilder, TimestampStyles, userMention, time } = require("discord.js")

const { sendMessage, editMessage } = require("../services/api")
const { Teamwork, MessageType } = require("../db/interactive")
const { i18n } = require("../locales")
const cancel_button = require("../components/teamwork/cancel-button")
const roll_button = require("../components/teamwork/roll-button")
const helper_picker = require("../components/teamwork/helper-picker")
const { logger } = require("../util/logger")

const MAX_DURATION = 900_000 // 15 minutes

module.exports = {
  /**
   * Maximum duration of the teamwork test, in milliseconds.
   *
   * @type int
   */
  MAX_DURATION,
  /**
   * Begin a teamwork test
   *
   * This sets up the test records in the database and shows a few controls for the test creator to manage
   * things.
   *
   * @param  {Interaction} options.interaction Command interaction object that started the test
   * @param  {str}         options.description Description for the eventual roll
   * @param  {str}         options.command     Name/ID of the command this roll will use
   * @param  {obj}         options.options     Object of options to pass to the command's teamwork methods
   * @param  {int}         options.pool        Initial pool of the teamwork leader
   */
  async teamworkBegin({ interaction, description, command, options, pool }) {
    // todo: if we don't have permission to send messages in this interaction's channel, we need to tell the admin
    const teamwork_db = new Teamwork()

    const locale = interaction.guild.locale ?? "en-US"
    const leader_id = interaction.user.id
    const test_id = teamwork_db.addTeamwork({
      command,
      options,
      leader: leader_id,
      channelId: interaction.channelId,
      description,
      locale,
      timeout: MAX_DURATION / 1_000,
    }).lastInsertRowid

    teamwork_db.addHelper({ teamwork_id: test_id, userId: leader_id, dice: pool })

    const t = i18n.getFixedT(locale, "interactive", "teamwork")

    const buttons_row = new ActionRowBuilder().addComponents(
      cancel_button.data(locale),
      roll_button.data(locale),
    )

    const request_row = new ActionRowBuilder().addComponents(helper_picker.data(locale))

    const expiry = new Date(Date.now() + MAX_DURATION)
    return interaction
      .reply({
        content: t("prompt.initial", {
          leader: userMention(leader_id),
          description: description,
          context: description ? "description" : undefined,
          timeout: time(expiry, TimestampStyles.RelativeTime),
        }),
        components: [buttons_row, request_row],
        withResponse: true,
      })
      .then((reply_interaction) => {
        setTimeout(module.exports.teamworkTimeout, MAX_DURATION, test_id)

        teamwork_db.addMessage({
          teamwork_id: test_id,
          message_uid: reply_interaction.resource.message.id,
          type: MessageType.Prompt,
        })
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            command: command,
            leader: leader_id,
            channel: interaction.channelId,
          },
          "Could not reply with initial teamwork prompt",
        ),
      )
  },

  /**
   * Handle the timeout of a teamwork test.
   *
   * This cleans up the test and sends a message notifying the channel that the test ran out of time without a
   * roll.
   *
   * @param  {int} teamwork_id Internal ID of the test which has timed out
   */
  async teamworkTimeout(teamwork_id) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.detail(teamwork_id)

    if (test === undefined) {
      logger.info({
        teamwork_id,
      },
      "Teamwork test completed before timeout")
      return
    }

    module.exports.cleanup(teamwork_id)

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")

    const t_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }
    return sendMessage(test.channel_uid, { content: t("timeout", t_args) }).catch((error) =>
      logger.error(
        {
          err: error,
          channel: test.channel_uid,
        },
        "Unable to send timeout message",
      ),
    )
  },

  /**
   * End and remove a test
   *
   * This removes the test record and all associated records from the database. It then edits the prompt
   * message to remove interactive controls and make it clear that the test is over.
   *
   * @param  {int} teamwork_id Internal ID of the test to clean
   */
  async cleanup(teamwork_id) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.detail(teamwork_id)
    const prompt_uid = teamwork_db.getPromptUid(teamwork_id)

    teamwork_db.destroy(teamwork_id)

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")
    const t_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }
    return editMessage(test.channel_uid, prompt_uid, {
      content: t("prompt.done", t_args),
      components: [],
      allowedMentions: { parse: [] },
    }).catch((error) =>
      logger.warning(
        {
          err: error,
          channel: test.channel_uid,
          prompt: prompt_uid,
        },
        "Unable to edit prompt message",
      ),
    )
  },
}
