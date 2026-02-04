import { list } from "../presenters/command-name-presenter.js"
import { ParentCommand } from "./abstract/parent-command.js"
import { savable } from "../index.js"
import { safe_locale } from "../locales/helpers.js"
import { Roll } from "./roll.js"
import { Grow } from "./saved/grow.js"
import { List } from "./saved/list.js"

/**
 * Class for the saved family of commands
 */
export class Saved extends ParentCommand {
  static name = "saved"
  static children = [Roll, Grow, List]
  static global = true

  static data() {
    const partialBuilder = super.data()
    return partialBuilder.setDMPermission(false)
  }

  static help_data(opts) {
    const locale = safe_locale(opts.locale)
    return {
      savable: list(savable.sorted.get(locale), locale),
    }
  }
}
