const { SlashCommandSubcommandBuilder, inlineCode } = require("discord.js")
const Completers = require("../../completers/saved-completers")
const presenter = require("../../presenters/saved-roll-presenter")
const { longReply } = require("../../util/long-reply")
const { UserSavedRolls } = require("../../db/saved_rolls")
const commonOpts = require("../../util/common-options")
const present_command = require("../../presenters/command-name-presenter").present
const { injectMention } = require("../../util/inject-user")
const { oneLine } = require("common-tags")

function change_target(bonus, change, savable) {
  if (!bonus) return undefined
  if (change) return change
  for (const opt of ["modifier", "pool"]) {
    if (savable.includes(opt)) {
      return opt
    }
  }
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
        .setDescription("A word or two about this roll. Defaults to the saved description.") // or should it be the saved name?
        .setMaxLength(1500)
      )
      .addIntegerOption((option) =>
        option.setName("bonus").setDescription("A number to add or subtract from the roll"),
      )
      .addStringOption((option) =>
        option.setName("change")
          .setDescription("Choose where to apply the bonus. Default is based on the saved command.")
          .setChoices(
            { name: "Modifier", value: "modifier" },
            { name: "Pool", value: "pool" },
            { name: "Difficulty", value: "difficulty" },
          )
      )
      .addIntegerOption((option) =>
        option.setName("rolls").setDescription("Roll this many times").setMinValue(1).setMaxValue(100)
      )
      .addBooleanOption(commonOpts.secret),
  change_target,
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const roll_name = interaction.options.getString("name") ?? ""
    const roll_id = parseInt(roll_name)

    const roll_detail = saved_rolls.detail(roll_id, roll_name)
    if(roll_detail === undefined) {
      return interaction.reply({
        content:
          "That roll does not exist. Check spelling, capitalization, or choose one of the suggested rolls.",
        ephemeral: true,
      })
    }

    if (roll_detail.invalid) {
      return interaction.reply({
        content: oneLine`
          The saved options for that roll are not valid. You'll have to update them before you can use this
          saved roll.
        `,
        ephemeral: true,
      })
    }

    if (roll_detail.incomplete) {
      return interaction.reply({
        content: "This roll is not finished. You have to save some options before you can use it.",
        ephemeral: true,
      })
    }

    const description = interaction.options.getString("description") ?? roll_detail.description // or should this be the name?
    roll_detail.options.description = description

    const bonus = interaction.options.getInteger("bonus") ?? 0
    const change = interaction.options.getString("change")
    const rolls = interaction.options.getInteger("rolls") ?? 0
    const secret = interaction.options.getBoolean("secret") ?? false

    const savable_commands = require("../index").savable()
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(bonus, change, command.savable)

    if (target) {
      if (!command.savable.includes(target)) {
        return interaction.reply({
          content: oneLine`
            Cannot change option ${inlineCode(target)}, since it does not exist for
            ${present_command(command)}.
          `,
          ephemeral: true,
        })
      }

      const old_number = roll_detail.options[target] ?? 0
      roll_detail.options[target] = old_number + bonus
    }

    if (rolls) roll_detail.options.rolls = rolls

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      if (target) {
        return interaction.reply({
          content: oneLine`
            This roll can no longer be made after changing the ${target}. The error is:\n* ${err.details[0].message}
          `,
          ephemeral: true,
        })
      } else {
        saved_rolls.update(roll_detail.id, {invalid: true})
        return interaction.reply({
          content: oneLine`
            The saved options for this roll are no longer valid. You'll have to update them before you can use
            this saved roll.
          `,
          ephemeral: true,
        })
      }
    }

    const partial_message = command.perform(roll_detail.options)
    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  async autocomplete(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "name":
        return Completers.saved_roll(partialText, saved_rolls.all())
    }
  },
  help({ command_name }) {
    return [
      `${command_name} lets you use a saved roll while tweaking its options.`,
      "",
      oneLine`
        The ${inlineCode("description")} and ${inlineCode("rolls")} options will entirely replace those that
        were saved with the roll. If you leave them out, the original values will be used.
      `,
      "",
      oneLine`
        If you give a ${inlineCode("bonus")}, it will be automatically added to the most appropriate number in
        the saved roll's options. It tries to change the ${inlineCode("modifier")} first and then the
        ${inlineCode("pool")}, using the first one that's supported by the saved command.
      `,
      "",
      oneLine`
        The ${inlineCode("change")} option lets you override this behavior and choose which saved option to
        alter. To support ${inlineCode("/wod20")} and other commands with a commonly changed difficulty, you
        can also choose to apply the ${inlineCode("bonus")} to the saved ${inlineCode("difficulty")} of the
        roll.
      `,
    ].join("\n")
  },
}
