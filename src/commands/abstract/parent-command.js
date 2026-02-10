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

  static data() {
    for (const child of this.children) {
      this.builder.addSubcommand(child.data())
    }
    return this.builder
  }

  /**
   * Handle the processing for parent commands
   *
   * These commands are essentially folders for their subcommands, so they are
   * not meant to be invoked separately.
   *
   * @throws Error
   */
  async execute() {
    throw new Error(`The command ${this.constructor.name} is a parent command and should never be invoked on its own.`)
  }
}
