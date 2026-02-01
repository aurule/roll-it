import { ButtonBuilder, ButtonStyle, userMention } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Teamwork } from "../../db/teamwork.js"
import { Component } from "../component.js"
import { cleanup } from "../../interactive/teamwork.js"

export function data(locale) {
  return new ButtonBuilder()
    .setCustomId("teamwork_cancel")
    .setLabel(i18n.t("prompt.components.cancel", { ns: "teamwork", lng: locale }))
    .setStyle(ButtonStyle.Danger)
}

export async function execute(interaction) {
  const teamwork_db = new Teamwork()
  const teamwork_test = teamwork_db.findTestByMessage(interaction.message.id)

  interaction.authorize(teamwork_test.leader)

  const t = i18n.getFixedT(teamwork_test.locale, "teamwork")

  cleanup(teamwork_test.id)

  const t_args = {
    leader: userMention(teamwork_test.leader),
    description: teamwork_test.description,
    context: teamwork_test.description ? "description" : undefined,
  }

  return interaction.ensure(
    "reply",
    {
      content: t("cancelled", t_args),
    },
    {
      component: "teamwork_cancel",
      detail: "could not whisper about teamwork cancellation",
    },
  )
}

export default new Component("teamwork_cancel", data, execute)
