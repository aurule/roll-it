const { SlashCommandSubcommandBuilder, inlineCode } = require("discord.js")
const saved_roll_completers = require("../../completers/saved-roll-completers")
const { added } = require("../../presenters/addition-presenter")
const { longReply } = require("../../util/long-reply")
const { UserSavedRolls } = require("../../db/saved_rolls")
const commonOpts = require("../../util/common-options")
const present_command = require("../../presenters/command-name-presenter").present
const { injectMention } = require("../../util/inject-user")
const { oneLine } = require("common-tags")

function change_target(bonus, change, changeable) {
  if (!bonus) return undefined
  if (change && changeable.includes(change)) return change
  return changeable[0]
}

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
          .setName("name")
          .setDescription("Name of the saved roll to use")
          .setRequired(true)
          .setAutocomplete(true),
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A word or two about this roll. Defaults to the saved description.")
          .setMaxLength(1500),
      )
      .addIntegerOption((option) =>
        option.setName("bonus").setDescription("A number to add or subtract from the roll"),
      )
      .addStringOption((option) =>
        option
          .setName("change")
          .setDescription("Choose where to apply the bonus. Default is based on the saved command.")
          .setAutocomplete(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("rolls")
          .setDescription("Roll this many times")
          .setMinValue(1)
          .setMaxValue(100),
      )
      .addBooleanOption(commonOpts.secret),
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
          ${inlineCode("/saved manage")} before you can use this saved roll.
        `,
      )
    }

    if (roll_detail.incomplete) {
      return interaction.whisper(
        "This roll is not finished. You have to save some options before you can use it.",
      )
    }

    const description = interaction.options.getString("description") ?? roll_detail.description
    roll_detail.options.description = description

    const bonus = interaction.options.getInteger("bonus") ?? 0
    const change = interaction.options.getString("change")
    const rolls = interaction.options.getInteger("rolls") ?? 0
    const secret = interaction.options.getBoolean("secret") ?? false

    const savable_commands = require("../index").savable()
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(bonus, change, command.changeable)

    if (target) {
      if (!command.changeable.includes(target)) {
        return interaction.whisper(
          oneLine`
            Cannot change option ${inlineCode(target)}, since it does not exist for
            ${present_command(command)}.
          `,
        )
      }

      const old_number = roll_detail.options[target] ?? 0
      roll_detail.options[target] = old_number + bonus
      roll_detail.options.description += added(bonus)
    }

    if (rolls) roll_detail.options.rolls = rolls

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      if (target) {
        return interaction.whisper(
          oneLine`
            This roll can no longer be made after changing the ${target}. The error is:\n* ${err.details[0].message}
          `,
        )
      } else {
        saved_rolls.update(roll_detail.id, { invalid: true })
        return interaction.whisper(
          oneLine`
            The saved options for this roll are no longer valid. You'll have to update them before you can use
            this saved roll.
          `,
        )
      }
    }

    const partial_message = command.perform(roll_detail.options)
    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
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
        if you wanted to change the ${inlineCode("pool")} for ${inlineCode("/roll")} or the
        ${inlineCode("difficulty")} for ${inlineCode("/wod20")}.
      `,
    ].join("\n")
  },
}
