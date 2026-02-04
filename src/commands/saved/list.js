import { presentList } from "../../presenters/saved-roll-presenter.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Class for the saved list command
 */
export const List = Child(ListBase, "saved")

/**
 * Base class for the saved list command
 */
class ListBase extends Command {
  static name = "list"

  static data() {
    return this.builder
  }

  perform() {
    const saved_rolls = new UserSavedRolls(this.interaction.guildId, this.interaction.user.id)

    return presentList(saved_rolls.all(), this.locale)
  }
}
