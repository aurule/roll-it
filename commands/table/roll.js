const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const Completers = require("../../completers/table-completers")
const { present } = require("../../presenters/results/table-results-presenter")
const { GuildRollables } = require("../../db/rollable")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")
const commonOpts = require("../../util/common-options")

const command_name = "roll"
const parent_name = "table"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedStringOption("table", (option) => option.setRequired(true).setAutocomplete(true))
      .addStringOption(commonOpts.description)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const tables = new GuildRollables(interaction.guildId)

    const t = i18n.getFixedT(interaction.locale, "commands", "table.roll")

    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const table_name = interaction.options.getString("table") ?? "0"
    const table_id = parseInt(table_name)

    const results = Array.from({ length: rolls }, () => tables.random(table_id, table_name))

    if (results[0] === undefined) {
      return interaction.whisper(t("options.table.validation.missing"))
    }

    const detail = tables.detail(table_id, table_name)

    const full_text = present({
      userFlake: interaction.user.id,
      rolls,
      tableName: detail.name,
      results,
      description: roll_description,
      locale: interaction.locale,
    })
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
  async autocomplete(interaction) {
    const tables = new GuildRollables(interaction.guildId)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "table":
        return Completers.table(partialText, tables.all())
    }
  },
}
