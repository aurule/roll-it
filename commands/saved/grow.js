const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const saved_roll_completers = require("../../completers/saved-roll-completers")
const { UserSavedRolls } = require("../../db/saved_rolls")
const present_command = require("../../presenters/command-name-presenter").present
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

function change_target(bonus, change, changeable) {
  if (change && changeable.includes(change)) return change
  return changeable[0]
}

const command_name = "grow"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedStringOption("name", (option) => option.setRequired(true).setAutocomplete(true))
      .addLocalizedIntegerOption("adjustment")
      .addLocalizedStringOption("change", (option) => option.setAutocomplete(true)),
  change_target,
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const t = i18n.getFixedT(interaction.locale, "commands", "saved.grow")

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

    const adjustment = interaction.options.getInteger("adjustment") ?? 0

    if (adjustment === 0) {
      return interaction.whisper(t("options.adjustment.validation.zero"))
    }

    const change = interaction.options.getString("change")

    const savable_commands = require("../index").savable
    const command = savable_commands.get(roll_detail.command)
    const target = change_target(adjustment, change, command.changeable)

    if (!command.changeable.includes(target)) {
      return interaction.whisper(
        t("options.change.validation.missing", { target, command: present_command(command, interaction.locale) }),
      )
    }

    const old_number = roll_detail.options[target] ?? 0
    const new_number = old_number + adjustment
    roll_detail.options[target] = new_number

    try {
      await command.schema.validateAsync(roll_detail.options)
    } catch (err) {
      return interaction.whisper(
        t("validation.invalid", { adjustment, target, message: err.details[0].message }),
      )
    }

    saved_rolls.update(roll_detail.id, { options: roll_detail.options })

    return interaction.whisper(
      t("response.success", { target, name: roll_detail.name, old: old_number, new: new_number }),
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
}
