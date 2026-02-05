import { saved_roll as suggestSavedRoll, changeable_choices as suggestChangeableOption } from "../../completers/saved-roll-completers.js"
import { operator } from "../../util/formatters/signed.js.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"
import { present } from "../../presenters/command-name-presenter.js"
import { saved_bonus_target } from "../../util/saved-bonus-target.js"
import { secretOption } from "../../util/common-options.js"
import { savable } from "../index.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the saved roll command
 */
class BaseRoll extends Command {
  static name = "saved"

  static secret = true

  rolls_db
  saved_roll
  command_options
  name = ""
  description = ""
  bonus = 0
  change = ""
  rolls = 0
  kommand
  change_target

  static data() {
    return this.builder
      .addLocalizedStringOption("name", (option) => option.setRequired(true).setAutocomplete(true))
      .addLocalizedStringOption("description", (option) => option.setMaxLength(1500))
      .addLocalizedIntegerOption("bonus")
      .addLocalizedStringOption("change", (option) => option.setAutocomplete(true))
      .addLocalizedIntegerOption("rolls", (option) => option.setMinValue(1).setMaxValue(100))
      .addBooleanOption(secretOption)
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("name")

    this.rolls_db = new UserSavedRolls(this.interaction.guildId, this.interaction.user.id)
    const roll_id = parseInt(this.name)
    this.saved_roll = this.rolls_db.detail(roll_id, this.name)
    this.command_options = this.saved_roll.options
    this.description = this.saved_roll.description

    this.saveOption("bonus")
    this.saveOption("change")
    this.saveOption("rolls")
    this.saveOption("description")

    this.kommand = savable.get(this.saved_roll.command)
    this.change_target = saved_bonus_target(this.bonus, this.change, this.kommand)
  }

  perform() {
    this.command_options.description = this.description
    this.command_options.secret = this.secret

    if (this.change_target) {
      const old_number = this.saved_roll.options[target] ?? 0
      this.command_options[target] = old_number + this.bonus
      this.command_options.description += operator(this.bonus)
    }

    if (this.rolls) this.command_options.rolls = this.rolls

    try {
      this.kommand.schema.validate(this.command_options)
    } catch (err) {
      if (this.change_target) {
        return this.t("validation.invalidated", { target: this.change_target, message: err.details[0].message })
      } else {
        this.rolls_db.update(this.saved_roll.id, { invalid: true })
        return this.t("validation.invalid")
      }
    }

    const command = new this.kommand(this.interaction, this.command_options)
    this.secret = this.command_options.secret
    return command.perform()
  }

  validate() {
    if (this.saved_roll === undefined) return this.t("options.name.validation.missing")
    if (this.saved_roll.invalid) return this.t("options.name.validation.invalid")

    if (this.change_target && !this.kommand.changeable.includes(this.change_target)) {
        return this.t("options.change.validation.missing", {
          target: change_target,
          command: present(kommand, interaction.locale),
        })
    }
  }

  async autocomplete() {
    const all_rolls = this.rolls_db.all()
    const focusedOption = this.interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "name":
        return suggestSavedRoll(partialText, all_rolls)
      case "change":
        return suggestChangeableOption(partialText, all_rolls, this.interaction.options)
    }
  }
}

/**
 * Class for the saved roll command
 */
export const Roll = Child(BaseRoll, "saved")
