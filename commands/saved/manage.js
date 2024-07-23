const {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  italic,
} = require("discord.js")
const { oneLine } = require("common-tags")
const Completers = require("../../completers/saved-completers")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { splitMessage } = require("../../util/long-reply")

module.exports = {
  name: "manage",
  parent: "saved",
  description: "Change or remove a saved roll",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("roll")
          .setDescription("Name of the saved roll to manage")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const roll_name = interaction.options.getString("table")
    const roll_id = parseInt(roll_name)

    const detail = saved_rolls.detail(roll_id, roll_name)

    if (detail === undefined) {
      return interaction.reply({
        content:
          "That saved roll does not exist. Check spelling, capitalization, or choose one of the suggested rolls.",
        ephemeral: true,
      })
    }

    // TODO
    // remove is like table remove
    // edit sets the saved roll to incomplete mode and shows the modal
    //  if something is already incomplete, show an error
    //  different button text for editing an incomplete vs complete roll

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
    return [
      `${command_name} lets you change the details about a saved roll, or remove it entirely.`,
      "",
      oneLine`
        Just like saving a new roll, you can leave the edit process and come back later. However, you can only
        have one unfinished roll at a time. That can either be a roll you just created, or a roll you are
        editing. Until you finish that roll's options, you will not be able to use it, nor will you be able to
        edit or create another saved roll.`,
      "",
      oneLine`
        Removing a saved roll is permanent. The only way to get it back is to save a new roll with the same
        name and options.
      `,
    ].join("\n")
  },
}
