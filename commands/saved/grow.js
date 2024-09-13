const { SlashCommandSubcommandBuilder, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const saved_roll_completers = require("../../completers/saved-roll-completers")
const { UserSavedRolls } = require("../../db/saved_rolls")
const present_command = require("../../presenters/command-name-presenter").present

function change_target(bonus, change, changeable) {
  if (change && changeable.includes(change)) return change
  return changeable[0]
}

module.exports = {
  name: "grow",
  parent: "saved",
  description: "Make a small change to a saved roll",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the saved roll to change")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addIntegerOption((option) =>
        option.setName("adjustment").setDescription("A number to add or subtract from the roll"),
      )
      .addStringOption((option) =>
        option
          .setName("change")
          .setDescription(
            "Choose where to apply the adjustment. Default is based on the saved command.",
          )
          .setAutocomplete(true),
      ),
  change_target,
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const roll_name = interaction.options.getString("name") ?? ""
    const roll_id = parseInt(roll_name)

    const roll_detail = saved_rolls.detail(roll_id, roll_name)
    if (roll_detail === undefined) {
      return interaction.whisper(
        "That roll does not exist. Check spelling, capitalization, or choose one of the suggested rolls.",
      )
    }

    if (roll_detail.invalid) {
      return interaction.whisper(
        oneLine`
          The saved options for that roll are not valid. You'll have to update them using
          ${inlineCode("/saved manage")}.
        `
      )
    }

    if (roll_detail.incomplete) {
      return interaction.whisper(
        oneLine`
          This roll is not finished. You have to save its name, description, and options before you can change
          it.
        `,
      )
    }

    const adjustment = interaction.options.getInteger("adjustment") ?? 0

    if (adjustment === 0) {
      return interaction.whisper(
        `An ${inlineCode("adjustment")} of zero won't change the roll, so it has been left alone.`,
      )
    }

    const change = interaction.options.getString("change")

    const savable_commands = require("../index").savable()
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(adjustment, change, command.changeable)

    if (!command.changeable.includes(target)) {
      return interaction.whisper(
        oneLine`
          Cannot change option ${inlineCode(target)}, since it does not exist for
          ${present_command(command)}.
        `
      )
    }

    const old_number = roll_detail.options[target] ?? 0
    const new_number = old_number + adjustment
    roll_detail.options[target] = new_number

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      return interaction.whisper(
        oneLine`
          This roll would be invalid after adding ${adjustment} to ${inlineCode(target)}, so it has not been
          changed. The error is:\n* ${err.details[0].message}
        `
      )
    }

    saved_rolls.update(roll_detail.id, { options: roll_detail.options })

    return interaction.whisper(
      oneLine`
        Updated ${inlineCode(target)} of ${italic(roll_detail.name)} from "${old_number}" to "${new_number}"
      `
    )
  },
  async autocomplete(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const all_rolls = saved_rolls.all()
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "name":
        return saved_roll_completers.saved_roll(partialText, all_rolls)
      case "change":
        return saved_roll_completers.change_target(partialText, all_rolls, interaction.options)
    }
  },
  help({ command_name, ...opts }) {
    return [
      `${command_name} lets you make a small change to a saved roll. As your character changes over time,
      ${command_name} makes it easy to keep any saved rolls up to date.`,
      "",
      oneLine`
        The value of ${opts.adjustment} will automatically be added to the most appropriate number in the
        saved roll's options. Most commands apply the bonus to their ${inlineCode("modifier")} by default, but
        some instead change the ${inlineCode("pool")} or another number entirely.
      `,
      "",
      oneLine`
        The ${opts.change} option lets you override this behavior and choose which saved option to alter, like
        if you wanted to change the ${inlineCode("pool")} for ${inlineCode("/roll")} or the
        ${inlineCode("difficulty")} for ${inlineCode("/wod20")}.
      `,
      "",
      oneLine`
        ${command_name} is only able to change one number at a time in a saved roll. If you need to make
        larger changes, use ${inlineCode("/saved manage")} instead.
      `,
    ].join("\n")
  },
}
