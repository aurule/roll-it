import { table as suggestTables } from "../../completers/table-completers.js"
import { present } from "../../presenters/results/table-results-presenter.js"
import { GuildRollables } from "../../db/rollable.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the table roll command
 */
class BaseRoll extends Command {
  static name = "roll"

  table = ""
  table_id = 0
  description = ""
  rolls = 1
  table_db

  static data() {
    return this.builder
      .addLocalizedStringOption("table", (option) => option.setRequired(true).setAutocomplete(true))
      .addStringOption(descriptionOption)
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption)
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("table")
    this.saveOption("description")
    this.saveOption("rolls")

    this.table_db = new GuildRollables(interaction.guildId)
    this.table_id = parseInt(this.table)
  }

  perform() {
    const results = Array.from({ length: this.rolls }, () => this.table_db.random(this.table_id, this.table_name))

    const detail = tables.detail(table_id, table_name)

    return present({
      userFlake: this.interaction.user.id,
      rolls: this.rolls,
      tableName: detail.name,
      results,
      description: this.description,
      locale: this.locale,
    })
  }

  validate() {
    if (!this.table_db.has(this.table_id, this.table)) {
      return this.t("options.table.validation.missing")
    }
  }

  async autocomplete() {
    const focusedOption = this.interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "table":
        return suggestTables(partialText, this.table_db.all())
    }
  }
}

/**
 * Class for the table roll command
 */
export const Roll = Child(BaseRoll, "table")
