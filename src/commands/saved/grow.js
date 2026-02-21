import { saved_roll as suggestSavedRoll, changeable_choices as suggestChangeableOption } from "../../completers/saved-roll-completers.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"
import { present } from "../../presenters/command-name-presenter.js"
import { saved_bonus_target } from "../../util/saved-bonus-target.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"
import { savable } from "../index.js"

/**
 * Base class for the saved grow command
 */
class GrowBase extends Command {
  static name = "grow"

  secret = true

  rolls_db
  saved_roll
  name = ""
  adjustment = 0
  change = ""
  kommand

  static data() {
    return this.builder
      .addLocalizedStringOption("name", (option) => option.setRequired(true).setAutocomplete(true))
      .addLocalizedIntegerOption("adjustment")
      .addLocalizedStringOption("change", (option) => option.setAutocomplete(true))
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("name")
    this.saveOption("adjustment")
    this.saveOption("change")

    this.rolls_db = new UserSavedRolls(this.interaction.guildId, this.interaction.user.id)
    const roll_id = parseInt(this.name)
    this.saved_roll = this.rolls_db.detail(roll_id, this.name)

    this.kommand = savable.get(this.saved_roll?.command)
  }

  perform() {
    const command_options = this.saved_roll?.options
    const change_target = saved_bonus_target(this.adjustment, this.change, this.kommand.changeable)

    const old_number = command_options[change_target] ?? 0
    const new_number = old_number + this.adjustment
    command_options[change_target] = new_number

    const schema_result = this.kommand.schema.validate(command_options)
    if (schema_result.error) {
      return this.t("validation.invalid", { adjustment: this.adjustment, target: change_target, message: schema_result.error.details[0].message })
    }

    this.rolls_db.update(this.saved_roll.id, { options: command_options })

    return this.t("response.success", { target: change_target, name: command_options.name, old: old_number, new: new_number })
  }

  validate() {
    if (this.saved_roll === undefined) return this.t("options.name.validation.missing")
    if (this.saved_roll.invalid) return this.t("options.name.validation.invalid")
    if (this.adjustment === 0) return this.t("options.adjustment.validation.zero")

    if (!this.kommand.changeable.includes(this.change)) {
        return this.t("options.change.validation.missing", {
          target: this.change,
          command: present(this.kommand, this.locale),
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
 * Class for the saved grow command
 */
export const Grow = Child(GrowBase, "saved")
