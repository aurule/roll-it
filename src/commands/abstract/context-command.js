import { ContextMenuCommandBuilder } from "discord.js"

import { Command } from "./command.js";
import { mapped } from "../locales/helpers.js"

/**
 * Class to handle Discord context menu commands
 */
export class ContextCommand extends Command {
  /**
   * The unique translation ID of this command
   *
   * Context commands use this to look up their translations, since the `name`
   * passed to and from Discord is a human-readable string and not suitable for
   * a yaml key.
   *
   * @type string
   */
  static i18nId

  static type = "menu"

  /**
   * Get a context command builder using our name
   * @return {ContextMenuCommandBuilder} Builder object
   */
  static get builder() {
    return new ContextMenuCommandBuilder()
      .setName(this.name)
      .setNameLocalizations(mapped("name", this.i18nId))
  }

  /**
   * Main invocation method
   *
   * Unlike slash commands, context commands have no default `execute` method.
   *
   * @return {Promise} Interaction-related promise
   */
  async execute() {
    throw new Error("The function `execute` is not implemented")
  }
}
