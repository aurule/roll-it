const { ButtonBuilder, ButtonStyle, userMention } = require("discord.js")
const { i18n } = require("../../locales")
const { Teamwork } = require("../../db/teamwork")
const { injectMention } = require("../../util/formatters")
const teamwork_summary = require("../../embeds/teamwork-summary")
const { logger } = require("../../util/logger")

module.exports = {
  name: "teamwork_roll",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("teamwork_roll")
      .setLabel(i18n.t("teamwork.prompt.components.roll", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Success),
  async execute(interaction) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.findTestByMessage(interaction.message.id)

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")

    if (interaction.user.id !== test.leader) {
      return interaction
        .whisper(t("unauthorized", { leader: userMention(test.leader) }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "teamwork_roll" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    const TeamworkManager = require("../../interactive/teamwork")

    const final_pool = teamwork_db.getFinalSumByMessage(interaction.message.id)
    if (final_pool === undefined) {
      logger.error({ test }, "Test has undefined final dice pool")
      await TeamworkManager.cleanup(test.id)
      return interaction
        .reply(t("invalid"))
        .catch((error) =>
          logger.error(
            { err: error, user: interaction.user.id, component: "teamwork_roll", test: test.id },
            `Test has invalid pool`,
          ),
        )
    }

    const command = require("../../commands").get(test.command)

    if (command === undefined) {
      logger.error(
        {
          test,
        },
        "Test has undefined command name",
      )
      await TeamworkManager.cleanup(test.id)
      return interaction
        .reply(t("invalid"))
        .catch((error) =>
          logger.error(
            { err: error, user: interaction.user.id, component: "teamwork_roll", test: test.id },
            `Test has invalid command`,
          ),
        )
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

    const embed = teamwork_summary.data(test)

    await TeamworkManager.cleanup(test.id)

    const t_args = {
      presented,
    }
    return interaction
      .reply({
        content: t("rolled", t_args),
        embeds: [embed],
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            user: interaction.user.id,
            component: "teamwork_roll",
            test: test.id,
            raw: raw_results,
            summed: summed_results,
            presented,
          },
          `Unable to reply with final roll`,
        ),
      )
  },
}
