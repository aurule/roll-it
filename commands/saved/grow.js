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
          .setDescription("Choose where to apply the adjustment. Default is based on the saved command.")
          .setAutocomplete(true),
      ),
  change_target,
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const roll_name = interaction.options.getString("name") ?? ""
    const roll_id = parseInt(roll_name)

    const roll_detail = saved_rolls.detail(roll_id, roll_name)
    if (roll_detail === undefined) {
      return interaction.reply({
        content:
          "That roll does not exist. Check spelling, capitalization, or choose one of the suggested rolls.",
        ephemeral: true,
      })
    }

    if (roll_detail.invalid) {
      return interaction.reply({
        content: oneLine`
          The saved options for that roll are not valid. You'll have to update them using
          ${inlineCode("/saved manage")}.
        `,
        ephemeral: true,
      })
    }

    if (roll_detail.incomplete) {
      return interaction.reply({
        content: oneLine`
          This roll is not finished. You have to save its name, description, and options before you can change
          it.
        `,
        ephemeral: true,
      })
    }

    const adjustment = interaction.options.getInteger("adjustment") ?? 0

    if (adjustment === 0) {
      return interaction.reply({
        content: `An ${inlineCode("adjustment")} of zero won't change the roll, so it has been left alone.`,
        ephemeral: true,
      })
    }

    const change = interaction.options.getString("change")

    const savable_commands = require("../index").savable()
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(adjustment, change, command.changeable)

    if (!command.changeable.includes(target)) {
      return interaction.reply({
        content: oneLine`
          Cannot change option ${inlineCode(target)}, since it does not exist for
          ${present_command(command)}.
        `,
        ephemeral: true,
      })
    }

    const old_number = roll_detail.options[target] ?? 0
    const new_number = old_number + adjustment
    roll_detail.options[target] = new_number

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      return interaction.reply({
        content: oneLine`
          This roll can no longer be made after changing the ${inlineCode(target)}. The error is:\n* ${err.details[0].message}
        `,
        ephemeral: true,
      })
    }

    saved_rolls.update(roll_detail.id, { options: roll_detail.options })

    return interaction.reply({
      content: oneLine`
        Updated ${inlineCode(target)} of ${italic(roll_detail.name)} from "${old_number}" to "${new_number}"
      `,
      ephemeral: true,
    })
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
      `${command_name} lets you use a saved roll while tweaking its options.`,
      "",
      oneLine`
        The ${opts.description} and ${opts.rolls} options will entirely replace what was
        saved with the roll. If you leave them out, ${opts.rolls} will use the original value and
        ${opts.description} will use the saved roll description.
      `,
      "",
      oneLine`
        If you give a ${opts.bonus}, it will automatically be added to the most appropriate number in the
        saved roll's options. Most commands apply the bonus to their ${inlineCode("modifier")} by default, but
        some instead change the ${inlineCode("pool")} or another option entirely.
      `,
      "",
      oneLine`
        The ${opts.change} option lets you override this behavior and choose which saved option to alter, like
        if you wanted to change the ${inlineCode("pool")} for ${inlineCode("/roll")}. To support
        ${inlineCode("/wod20")} and other commands with a commonly changed difficulty, you can also choose to
        apply the ${opts.bonus} to the saved ${inlineCode("difficulty")} of the roll. The difficulty
        will never be changed automatically.
      `,
    ].join("\n")
  },
}
