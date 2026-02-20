import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Teamwork } from "../../db/teamwork.js"
import { injectMention } from "../../util/formatters/inject-user.js"
import { TeamworkSummaryEmbed } from "../../embeds/teamwork-summary.js"
import { logger } from "../../util/logger.js"
import { commands } from "../../commands/index.js"
import { cleanup } from "../../interactive/teamwork.js"
import { Component } from "../component.js"
import { CommandOptions } from "../../commands/abstract/command-options.js"

export function data(locale) {
  return new ButtonBuilder()
    .setCustomId("teamwork_roll")
    .setLabel(i18n.t("prompt.components.roll", { ns: "teamwork", lng: locale }))
    .setStyle(ButtonStyle.Success)
}

export async function execute(interaction) {
  const teamwork_db = new Teamwork()
  const test = teamwork_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.leader)

  const t = i18n.getFixedT(test.locale, "teamwork")

  const final_pool = teamwork_db.getFinalSum(test.id)

  const kommand = commands.get(test.command)

  if (kommand === undefined) {
    logger.error(
      {
        test,
      },
      "Test has undefined command name",
    )
    await cleanup(test.id)
    return interaction.ensure("reply", t("invalid"), {
      test: test.id,
      detail: "Could not reply about invalid test",
    })
  }

  const options = new CommandOptions(test.options)
  const command = new kommand(interaction, options)
  const partial_message = command.performTeamwork(final_pool)

  const presented = injectMention(partial_message, test.leader)

  const embed = new TeamworkSummaryEmbed(test).data()

  await cleanup(test.id)

  const t_args = {
    presented,
  }
  return interaction.ensure(
    "reply",
    {
      content: t("rolled", t_args),
      embeds: [embed],
    },
    {
      test: test.id,
      presented,
      detail: "Unable to reply with final teamwork roll",
    },
  )
}

export default new Component("teamwork_roll", data, execute)
