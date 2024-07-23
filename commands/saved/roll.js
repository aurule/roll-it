const { SlashCommandSubcommandBuilder } = require("discord.js")
const Completers = require("../../completers/table-completers")
const { present } = require("../../presenters/table-results-presenter")
const { longReply } = require("../../util/long-reply")
const { UserSavedRolls } = require("../../db/saved_rolls")
const commonOpts = require("../../util/common-options")

module.exports = {
  name: "roll",
  parent: "saved",
  description: "Use one of your saved rolls",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("roll")
          .setDescription("Name of the saved roll to use")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption(commonOpts.description) // maybe with a default?
      // TODO
      // optional pool
      // optional modifier
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    // get the roll
    // get its options
    // look up the correct command object and send it to the perform() method
    // inject and reply
    //
    // warn if invalid
    // warn if incomplete
    const tables = new GuildRollables(interaction.guildId)

    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const table_name = interaction.options.getString("table") ?? "0"
    const table_id = parseInt(table_name)

    const results = Array.from({ length: rolls }, (v) => tables.random(table_id, table_name))

    if (results[0] === undefined) {
      return interaction.reply({
        content:
          "That table does not exist. Check spelling, capitalization, or choose one of the suggested tables.",
        ephemeral: true,
      })
    }

    const detail = tables.detail(table_id, table_name)

    const full_text = present({
      userFlake: interaction.user.id,
      rolls,
      tableName: detail.name,
      results,
      description: roll_description,
    })
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  async autocomplete(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "roll":
        return Completers.saved_roll(partialText, saved_rolls.all())
    }
  },
  help({ command_name }) {
    return `${command_name} gets a random entry from a table on this server.`
  },
}
