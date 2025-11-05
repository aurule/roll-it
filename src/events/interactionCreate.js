const { MessageFlags, Events } = require("discord.js")
const { logger } = require("../util/logger")
const { getReplyFn } = require("../util/getReplyFn")
const { metrics } = require("../db/stats")
const PolicyChecker = require("../services/policy-checker")
const interactionCache = require("../services/interaction-cache")
const { i18n } = require("../locales")
const { envAllowsGuild } = require("../util/env-allows-guild")
const components = require("../components")

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
  metrics.logCommand(interaction.guildId, interaction.commandName, interaction.locale)

  const policyResult = await PolicyChecker.check(command.policy, interaction)

  if (!policyResult.allowed) {
    return interaction.whisper(policyResult.errorMessages.join(". "))
  }

  await interactionCache.set(interaction)
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
 * Handle modal submission interactions
 *
 * @param  {Interaction} interaction  Discord interaction object
 * @return {Promise}                  Promise, probably from replying to the
 *                                    interaction. Rejects if modal not found.
 */
async function handleModal(interaction) {
  const [modal_name, modal_id] = interaction.customId.split("_")

  const modal = interaction.client.modals.get(modal_name)
  if (!modal) return Promise.reject(`no modal ${interaction.customId}`)

  logger.info(
    {
      modal: modal.name,
    },
    `modal ${modal.name} submitted`,
  )

  return modal.submit(interaction, modal_id)
}

async function handleComponent(interaction) {
  logger.info(
    {
      componentType: interaction.componentType,
      customId: interaction.customId,
    },
    `component ${interaction.customId} used`,
  )

  return components.handle(interaction)
}

module.exports = {
  name: Events.InteractionCreate,
  logMe: true,
  logContext(interaction) {
    if (interaction.isCommand() || interaction.isChatInputCommand()) {
      return {
        commandName: interaction.commandName,
      }
    }

    if (interaction.isAutocomplete()) {
      return {
        commandName: interaction.commandName,
        option: interaction.options.getFocused(true),
      }
    }

    if (interaction.isModalSubmit()) {
      return {
        customId: interaction.customId,
      }
    }

    if (
      interaction.isButton() ||
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu() ||
      interaction.isRoleSelectMenu() ||
      interaction.isChannelSelectMenu() ||
      interaction.isMentionableSelectMenu()
    ) {
      return {
        componentType: interaction.componentType,
        customId: interaction.customId,
      }
    }
  },
  handleCommand,
  handleAutocomplete,
  handleModal,
  handleComponent,

  /**
   * Handle the incoming interaction event
   *
   * @param  {Interaction} interaction  Discord interaction object
   * @return {Promise}                  Promise of some form, contents vary. Usually
   *                                    from a call to interaction.reply()
   */
  execute(interaction) {
    if (!envAllowsGuild(interaction.guildId)) return Promise.resolve("wrong guild for env")

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
          content: i18n.t("command.error", { lng: interaction.locale }),
          components: [],
          flags: MessageFlags.Ephemeral,
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

    // handle modal submissions
    if (interaction.isModalSubmit()) {
      return module.exports.handleModal(interaction).catch((err) => {
        logger.error(
          {
            origin: "modal",
            err: err,
            guild: interaction.guildId,
            modal: interaction.customId,
            fields: interaction.fields,
          },
          `Error while processing modal ${interaction.customId}`,
        )
      })
    }

    // handle component interactions
    if (
      interaction.isButton() ||
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu() ||
      interaction.isRoleSelectMenu() ||
      interaction.isChannelSelectMenu() ||
      interaction.isMentionableSelectMenu()
    ) {
      return module.exports.handleComponent(interaction).catch((err) => {
        logger.error(
          {
            origin: "component",
            err: err,
            guild: interaction.guildId,
          },
          `Error while processing component ${interaction.customId}`,
        )
      })
    }
  },
}
