import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Teamwork } from "../../db/teamwork.js"
import { injectMention } from "../../util/formatters/inject-user.js"
import { TeamworkSummaryEmbed } from "../../embeds/teamwork-summary.js"
import { logger } from "../../util/logger.js"
import { commands } from "../../commands/index.js"
import { TeamworkManager } from "../../interactive/teamwork.js"
import { Component } from "../component.js"

export function data(locale) {
  new ButtonBuilder()
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

  const command = commands.get(test.command)

  if (command === undefined) {
    logger.error(
      {
        test,
      },
      "Test has undefined command name",
    )
    await TeamworkManager.cleanup(test.id)
    return interaction.ensure("reply", t("invalid"), {
      test: test.id,
      detail: "Could not reply about invalid test",
    })
  }

  const raw_results = command.teamwork.roller(final_pool, test.options.roller)
  const summed_results = command.teamwork.summer(raw_results, test.options.summer)
  const presented_raw = command.teamwork.presenter(
    final_pool,
    raw_results,
    summed_results,
    test.locale,
    test.options.presenter,
  )
  const presented = injectMention(presented_raw, test.leader)

  const embed = new TeamworkSummaryEmbed(test).data()

  await TeamworkManager.cleanup(test.id)

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
      raw: raw_results,
      summed: summed_results,
      presented,
      detail: "Unable to reply with final teamwork roll",
    },
  )
}

export default new Component("teamwork_roll", data, execute)
