const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const saved_roll_completers = require("../../completers/saved-roll-completers")
const { operator } = require("../../util/formatters")
const { UserSavedRolls } = require("../../db/saved_rolls")
const commonOpts = require("../../util/common-options")
const present_command = require("../../presenters/command-name-presenter").present
const { injectMention } = require("../../util/formatters")
const { oneLine } = require("common-tags")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

function change_target(bonus, change, changeable) {
  if (!bonus) return undefined
  if (change && changeable.includes(change)) return change
  return changeable[0]
}

const command_name = "roll"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedStringOption("name", (option) => option.setRequired(true).setAutocomplete(true))
      .addLocalizedStringOption("description", (option) => option.setMaxLength(1500))
      .addLocalizedIntegerOption("bonus")
      .addLocalizedStringOption("change", (option) => option.setAutocomplete(true))
      .addLocalizedIntegerOption("rolls", (option) => option.setMinValue(1).setMaxValue(100))
      .addBooleanOption(commonOpts.secret),
  change_target,
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const t = i18n.getFixedT(interaction.locale, "commands", "saved.roll")

    const roll_name = interaction.options.getString("name") ?? ""
    const roll_id = parseInt(roll_name)

    const roll_detail = saved_rolls.detail(roll_id, roll_name)
    if (roll_detail === undefined) {
      return interaction.whisper(t("options.name.validation.missing"))
    }

    if (roll_detail.invalid) {
      return interaction.whisper(t("options.name.validation.invalid"))
    }

    if (roll_detail.incomplete) {
      return interaction.whisper(t("options.name.validation.incomplete"))
    }

    const description = interaction.options.getString("description") ?? roll_detail.description
    roll_detail.options.description = description

    const bonus = interaction.options.getInteger("bonus") ?? 0
    const change = interaction.options.getString("change")
    const rolls = interaction.options.getInteger("rolls") ?? 0
    const secret = interaction.options.getBoolean("secret") ?? false

    const savable_commands = require("../index").savable
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(bonus, change, command.changeable)

    if (target) {
      if (!command.changeable.includes(target)) {
        return interaction.whisper(
          t("options.change.validation.missing", { target, command: present_command(command) }),
        )
      }

      const old_number = roll_detail.options[target] ?? 0
      roll_detail.options[target] = old_number + bonus
      roll_detail.options.description += operator(bonus)
    }

    if (rolls) roll_detail.options.rolls = rolls

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      if (target) {
        return interaction.whisper(
          t("validation.invalidated", { target, message: err.details[0].message }),
        )
      } else {
        saved_rolls.update(roll_detail.id, { invalid: true })
        return interaction.whisper(t("validation.invalid"))
      }
    }

    const partial_message = command.perform({
      locale: interaction.locale,
      ...roll_detail.options,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
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
}
