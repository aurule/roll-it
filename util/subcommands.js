const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")
const { oneLine } = require("common-tags")
const { jsNoTests, noDotFiles } = require("../util/filters")
const { logger } = require("../util/logger")

const commands_path = path.join(__dirname, "..", "commands")

const allowed_dispatch_functions = ["execute", "autocomplete"]

/**
 * Common helpers to load and execute subcommands
 *
 * This module us currently only able to handle shallow subcommands and cannot deal with subcommand groups.
 */
module.exports = {
  /**
   * Load the subcommand files for a top-level command
   *
   * Every js file in `targetDir` is assumed to be a subcommand.
   *
   * @param  {str} targetDir Name of the directory to search for subcommand files
   * @return {Collection}    Collection of subcommand objects, keyed by name
   */
  loadSubcommands(targetDir) {
    const subcommands = new Collection()

    const subdir = path.join(commands_path, targetDir)
    const files = fs.readdirSync(subdir).filter(jsNoTests).filter(noDotFiles)
    files.forEach((subcommand_file) => {
      const subcommand = require(path.join(subdir, subcommand_file))
      subcommands.set(subcommand.name, subcommand)
    })

    return subcommands
  },

  /**
   * Send subcommand interactions to the correct handler function
   *
   * If the subcommand named by the interaction does not exist in `subcommands`, this immediately replies with
   * an error message.
   *
   * @param  {Interaction} interaction The interaction to handle
   * @param  {Collection}  subcommands Collection of subcommand objects
   * @param  {str}                     Name of the command's function to run. Must be one of "execute" or "autocomplete"
   * @return {Promise}                 A promise resolving to the result of executing the subcommand.
   */
  dispatch(interaction, subcommands, funktion = "execute") {
    if (!allowed_dispatch_functions.includes(funktion))
      throw new TypeError(`invalid function ${funktion}`)

    const subcommand_name = interaction.options.getSubcommand()

    const subcommand = subcommands.get(subcommand_name)

    if (!subcommand) {
      const error_contents = {
        command: interaction.commandName,
        subcommand: subcommand_name,
      }
      logger.error(error_contents, "No such subcommand")
      return interaction.reply({
        content: oneLine`
          Something went wrong while handling that command. You can try again in a couple of minutes, but
          it might be a while until the problem is fixed.
        `,
        ephemeral: true,
      })
    }

    return subcommand[funktion](interaction)
  },
}
