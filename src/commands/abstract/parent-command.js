import { Collection } from "discord.js"

import { sendError } from "../../services/metrics.js"
import { Command } from "./command.js"

/**
 * Class for parent commands
 *
 * Subcommands are added in the order they appear in the children array.
 */
export class ParentCommand extends Command {
  /**
   * List of child commands
   * @type ChildCommand[]
   */
  static children

  /**
   * Internal var to hold constructed collection of subcommands
   * @type Collection<string, ChildCommand>
   */
  static _subcommands

  /**
   * Indexed collection of child commands
   * @type Collection<string, ChildCommand>
   */
  static get subcommands() {
    if (!this._subcommands) {
      this._subcommands = new Collection()
      for (const child of this.children) {
        this._subcommands.set(child.name, child)
      }
    }

    return this._subcommands
  }

  static data() {
    for (const subcommand of this.children) {
      this.builder.addSubcommand(subcommand.data())
    }
    return this.builder
  }

  /**
   * Get the target subcommand class
   * @type ChildCommand
   */
  get subkommand() {
    return this.constructor.subcommands.get(this.interaction.options.getSubcommand())
  }

  async execute() {
    const child_name = this.interaction.options.getSubcommand()

    if (!this.subkommand) {
      sendError(new Error(`No such subcommand ${child_name} for ${this.constructor.name}`), {
        command: this.constructor.name,
        subcommand: child_name
      })
      return interaction.whisper(
        oneLine`
          Something went wrong while handling that command. You can try again in a couple of minutes, but
          it might be a while until the problem is fixed.
        `,
      )
    }

    const subcommand = new this.subkommand(interaction)
    return subcommand.execute()
  }

  async autocomplete() {
    const child_name = this.interaction.options.getSubcommand()

    if (!this.subkommand) {
      sendError(new Error(`No such subcommand ${child_name} for ${this.constructor.name}`), {
        command: this.constructor.name,
        subcommand: child_name
      })
      return []
    }

    const subcommand = new this.subkommand(interaction)
    return subcommand.autocomplete()
  }
}
