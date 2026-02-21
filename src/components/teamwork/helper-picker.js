import { UserSelectMenuBuilder, userMention } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Teamwork, MessageType } from "../../db/teamwork.js"
import { TeamworkChangeEmbed } from "../../embeds/teamwork-change.js"
import { arrayEq } from "../../util/array-eq.js"
import { logger } from "../../util/logger.js"
import { messageLink } from "../../util/formatters/message-link.js"
import { Component } from "../component.js"

export function data(locale) {
  return new UserSelectMenuBuilder({
    placeholder: i18n.t("prompt.components.request", { ns: "teamwork", lng: locale }),
  })
    .setCustomId("teamwork_request")
    .setMinValues(0)
    .setMaxValues(25)
}

export async function execute(interaction) {
  const teamwork_db = new Teamwork()
  const test = teamwork_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.leader)

  const t = i18n.getFixedT(test.locale, "teamwork")

  const original = teamwork_db.getRequestedHelpers(test.id).map((h) => h.user_uid)
  const current = interaction.values.filter(v => v != process.env.CLIENT_ID)

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

  const embed = new TeamworkChangeEmbed(test).data()

  return interaction
    .ensure(
      "reply",
      {
        content: t("help_requested.message", t_args),
        embeds: [embed],
        allowed_mentions: {
          users: [diff],
        },
        withResponse: true,
      },
      {
        test: test.id,
        detail: "Failed to reply with updated helper information",
      },
    )
    .then((reply_result) => {
      // expect an InteractionCallbackResponse, but deal with a Message too
      const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

      teamwork_db.addMessage({
        teamwork_id: test.id,
        message_uid: message_uid,
        type: MessageType.Plain,
      })
    })
}

export default new Component("teamwork_request", data, execute)
