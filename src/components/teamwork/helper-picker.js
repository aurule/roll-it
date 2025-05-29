const { UserSelectMenuBuilder, userMention } = require("discord.js")
const { i18n } = require("../../locales")
const { Teamwork } = require("../../db/teamwork")
const teamwork_change = require("../../embeds/teamwork-change")
const { arrayEq } = require("../../util/array-eq")
const { logger } = require("../../util/logger")
const { messageLink } = require("../../util/formatters/message-link")

module.exports = {
  name: "teamwork_request",
  data: (locale) =>
    new UserSelectMenuBuilder({
      placeholder: i18n.t("teamwork.prompt.components.request", { ns: "interactive", lng: locale }),
    })
      .setCustomId("teamwork_request")
      .setMinValues(0)
      .setMaxValues(25),
  async execute(interaction) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.findTestByMessage(interaction.message.id)

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")

    if (interaction.user.id !== test.leader) {
      return interaction
        .whisper(t("unauthorized", { leader: userMention(test.leader) }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "teamwork_request" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    const original = teamwork_db.getRequestedHelpers(test.id)
    const current = interaction.values

    if (arrayEq(original, current)) {
      return interaction
        .whisper(t("help_requested.unchanged"))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "teamwork_request" },
            `Could not whisper about unchanged helpers`,
          ),
        )
    }

    teamwork_db.setRequestedHelpers(test.id, current)

    if (current.includes(process.env.CLIENT_ID)) {
      teamwork_db.setDice(test.id, process.env.CLIENT_ID, 0)
    }

    const diff = current.filter((h) => !(h === test.leader || original.includes(h)))

    const prompt_link = messageLink({
      id: teamwork_db.getPromptUid(test.id),
      channelId: test.channel_uid,
      guildId: interaction.guildId,
    })
    const t_args = {
      helpers: diff.map(userMention),
      leader: userMention(test.leader),
      context: diff.length > 0 ? "added" : "removed",
      prompt_link,
    }

    const embed = teamwork_change.data(test)

    return interaction
      .reply({
        content: t("help_requested.message", t_args),
        embeds: [embed],
        allowed_mentions: {
          users: [diff],
        },
      })
      .then((reply_interaction) => {
        teamwork_db.addMessage({
          teamwork_id: test.id,
          message_uid: reply_interaction.id,
          type: MessageType.Plain,
        })
      })
      .catch((error) =>
        logger.error(
          { err: error, user: interaction.user.id, component: "teamwork_request", test: test.id },
          `Could not reply with updated helper information`,
        ),
      )
  },
}
