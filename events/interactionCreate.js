const { logger } = require("../util/logger")
const { getReplyFn } = require("../util/getReplyFn")
const { metrics } = require("../db/stats")

const PolicyChecker = require("../services/policy-checker")

/**
 * Handle command interactions
 *
 * We first apply the command's policy, then execute the actual command
 *
 * @param  {Interaction} interaction  Discord interaction object
 * @return {Promise}                  Promise, probably from replying to the
 *                                    interaction. Rejects if command not found.
 */
async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) return Promise.reject(`no command ${interaction.commandName}`)

  logger.info(
    {
      command: interaction.commandName,
    },
    `command ${interaction.commandName} called`,
  )
  metrics.logCommand(interaction.guildId, interaction.commandName)

  const policyResult = await PolicyChecker.check(command.policy, interaction)

  if (!policyResult.allowed) {
    return interaction.reply({
      content: policyResult.errorMessages.join(". "),
      ephemeral: true,
    })
  }

  return command.execute(interaction)
}

/**
 * Handle autocomplete interactions
 *
 * @param  {Interaction} interaction  Discord interaction object
 * @return {Promise}                  Promise, probably from responding to the
 *                                    interaction. Rejects if command or
 *                                    completer isn't found.
 */
async function handleAutocomplete(interaction) {
  const command = interaction.client.commands.get(interaction.commandName)
  if (!command) return Promise.reject(`no command ${interaction.commandName} (autocomplete)`)

  const completer = command.autocomplete
  const option = interaction.options.getFocused(true)
  if (!completer)
    return Promise.reject(
      `no autocomplete for option ${option.name} on command ${interaction.commandName}`,
    )

  logger.info(
    {
      command: command.name,
      option: option.name,
    },
    `autocomplete called for option ${option.name} on command ${interaction.commandName}`,
  )

  return completer(interaction).then((result) => interaction.respond(result))
}

/**
 * Determine if we're running in the right environment to handle the current guild
 *
 * When in the "development" environment, this returns true only for guilds whose
 * snowflake appears in the DEV_GUILDS envvar. In all other environments, this
 * returns false for guilds in DEV_GUILDS and true for all other guilds.
 *
 * @param  {Interaction} interaction  Discord interaction object
 * @return {bool}                     True if we should handle the guild, false if not
 */
function inCorrectEnv(interaction) {
  return (
    !(process.env.NODE_ENV !== "development") ==
    process.env.DEV_GUILDS.includes(interaction.guildId)
  )
}

module.exports = {
  name: "interactionCreate",
  handleCommand,
  handleAutocomplete,
  inCorrectEnv,

  /**
   * Handle the incoming interaction event
   *
   * @param  {Interaction} interaction  Discord interaction object
   * @return {Promise}                  Promise of some form, contents vary. Usually
   *                                    from a call to interaction.reply()
   */
  execute(interaction) {
    if (!module.exports.inCorrectEnv(interaction)) return Promise.resolve("wrong guild for env")

    // handle command invocations
    if (interaction.isCommand() || interaction.isChatInputCommand()) {
      return module.exports.handleCommand(interaction).catch((err) => {
        logger.error(
          {
            origin: "command",
            err,
            guild: interaction.guildId,
            command: interaction.commandName,
            options: interaction.options.data,
          },
          `Error while executing command ${interaction.commandName}`,
        )
        const fn = getReplyFn(interaction)
        return interaction[fn]({
          content: "There was an error while executing this command!",
          components: [],
          ephemeral: true,
        })
      })
    }

    // handle autocomplete requests
    if (interaction.isAutocomplete()) {
      return module.exports.handleAutocomplete(interaction).catch((err) => {
        logger.error(
          {
            origin: "autocomplete",
            err: err,
            guild: interaction.guildId,
            command: interaction.commandName,
            option: interaction.options.getFocused(true),
          },
          `Error while executing autocomplete for command ${interaction.commandName}`,
        )
        return interaction.respond([])
      })
    }
  },
}
