import { list } from "../presenters/command-name-presenter.js"
import { ParentCommand } from "./abstract/parent-command.js"
import { Roll } from "./saved/roll.js"
import { Grow } from "./saved/grow.js"
import { List } from "./saved/list.js"
import { Manage } from "./saved/manage.js"
import { registerCommand, sortedCommands } from "./index.js"

/**
 * Class for the saved family of commands
 */
export class Saved extends ParentCommand {
  static name = "saved"
  static children = [Roll, Grow, List, Manage]
  static global = true

  static data() {
    const partialBuilder = super.data()
    partialBuilder.setDMPermission(false)
    return partialBuilder
  }

  static help_data(opts) {
    return {
      savable: list(sortedCommands(opts.locale).savable, opts.locale),
    }
  }
}

registerCommand(Saved)
