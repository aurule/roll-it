import { presentList } from "../../presenters/table-list-presenter.js"
import { GuildRollables } from "../../db/rollable.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Class for the table list command
 */
export const List = Child(BaseList, "table")

/**
 * Base class for the table list command
 */
class BaseList extends Command {
  static name = "list"

  table_db

  static data() {
    return this.builder
  }

  constructor(interaction) {
    super(interaction)

    this.table_db = new GuildRollables(interaction.guildId)
  }

  perform() {
    return presentList(this.table_db.all(), this.t)
  }
}
