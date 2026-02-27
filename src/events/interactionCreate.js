import { MessageFlags } from "discord.js"
import { logger } from "../util/logging/setup.js"
import { getReplyFn } from "../util/getReplyFn.js"
import { check as checkPolicy } from "../services/policy-checker.js"
import interactionCache from "../services/interaction-cache.js"
import { i18n } from "../locales/index.js"
import { envAllowsGuild } from "../util/env-allows-guild.js"
import { handleComponentInteraction } from "../components/index.js"
import { sendError, sendEvent } from "../services/metrics.js"
import { commands } from "../commands/index.js"
import { modals } from "../modals/index.js"


/**
 * Handle command interactions
 *
 * We first apply the command's policy, then execute the actual command
 *
 * @param  {Interaction}          interaction Discord interaction object
 * @param  {Map<string, Command>} override    Optional map of command objects to dispatch
 * @return {Promise}              Promise, probably from replying to the interaction. Rejects if command not found.
 */
export async function handleCommand(interaction, override) {
  const command_key = interaction.options._subcommand ? `${interaction.commandName} ${interaction.options.getSubcommand()}` : interaction.commandName
  const registry = override ?? commands
  const kommand = registry.get(command_key)

  if (!kommand) return Promise.reject(`no command ${interaction.commandName}`)

  logger.info(
    {
      command: command_key,
    },
    `command ${command_key} called`,
  )

  const policyResult = await checkPolicy(kommand.policy, interaction)

  if (!policyResult.allowed) {
    return interaction.whisper(policyResult.errorMessages.join(". "))
  }

  await interactionCache.set(interaction)
  const command = new kommand(interaction)
  return command.execute()
}

/**
 * Handle autocomplete interactions
 *
 * @param  {Interaction}          interaction Discord interaction object
 * @param  {Map<string, Command>} override    Optional map of command objects to dispatch
 * @return {Promise}              Promise, probably from responding to the interaction. Rejects if command or completer isn't defined.
 */
export async function handleAutocomplete(interaction, override) {
  const command_key = interaction.options._subcommand ? `${interaction.commandName} ${interaction.options.getSubcommand()}` : interaction.commandName
  const registry = override ?? commands
  const kommand = registry.get(command_key)
  if (!kommand) return Promise.reject(`no command ${interaction.commandName} (autocomplete)`)

  const command = new kommand(interaction)
  return command.autocomplete().then((result) => interaction.respond(result))
}

/**
 * Handle modal submission interactions
 *
 * @param  {Interaction}        interaction Discord interaction object
 * @param  {Map<string, Modal>} override    Optional map of modal objects to dispatch
 * @return {Promise}            Promise, probably from replying to the interaction. Rejects if modal not found.
 */
export async function handleModal(interaction, override) {
  const [modal_name, modal_id] = interaction.customId.split("_")

  const registry = override ?? modals
  const modal = registry.get(modal_name)
  if (!modal) return Promise.reject(`no modal ${interaction.customId}`)

  logger.info(
    {
      modal: modal.name,
    },
    `modal ${modal.name} submitted`,
  )

  return new modal(interaction, modal_id).submit()
}

/**
 * Handle component usage interactions
 * @param  {Interaction} interaction  Discord interaction object
 * @return {Promise}                  Promise, probably from replying to the
 *                                    interaction.
 */
export async function handleComponent(interaction) {
  logger.info(
    {
      componentType: interaction.componentType,
      customId: interaction.customId,
    },
    `component ${interaction.customId} used`,
  )

  return handleComponentInteraction(interaction)
}

/**
 * Handle the incoming interaction event
 *
 * @param  {Interaction} interaction  Discord interaction object
 * @return {Promise}                  Promise of some form, contents vary. Usually
 *                                    from a call to interaction.reply()
 */
export async function handleInteractionCreated(interaction) {
  if (!envAllowsGuild(interaction.guildId)) return Promise.resolve("wrong guild for env")

  // handle command invocations
  if (interaction.isCommand() || interaction.isChatInputCommand()) {
    sendEvent("command used", interaction.user.id, { name: interaction.user.username })
    return handleCommand(interaction).catch((err) => {
      sendError(err, {
        guildId: interaction.guildId,
        command: interaction.commandName,
        options: interaction.options.data,
      })
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
    return handleAutocomplete(interaction).catch((err) => {
      sendError(err, {
        guildId: interaction.guildId,
        command: interaction.commandName,
        option: interaction.options.getFocused(true),
      })
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
    return handleModal(interaction).catch((err) => {
      sendError(err, {
        guild: interaction.guildId,
        modal: interaction.customId,
        fields: interaction.fields,
      })
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
    return handleComponent(interaction).catch((err) => {
      sendError(err, {
        guild: interaction.guildId,
      })
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
}
