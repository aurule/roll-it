import { ButtonBuilder, ButtonStyle } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Installation } from "../../db/installation.js"
import { setGuildCommands } from "../../services/api.js"
import { logger } from "../../util/logger.js"
import { present } from "../../presenters/command-name-presenter.js"
import { safe_locale } from "../../locales/helpers.js"
import { sendError } from "../../services/metrics.js"
import { Component } from "../component"
import { guild as guildc } from "../../commands/index.js"

/**
 * Button to save changes to installed commands
 */
export default new Component("install_save", data, execute)

export function data(locale) {
  const t = i18n.getFixedT(locale, "install", "shared.components.save")
  return new ButtonBuilder()
    .setCustomId("install_save")
    .setLabel(t("text"))
    .setStyle(ButtonStyle.Primary)
}

export async function execute(interaction) {
  const install_db = new Installation()
  const install = install_db.findInstallationByMessage(interaction.message.id)
  const locale = install.locale
  const t = i18n.getFixedT(locale, "install")

  interaction.authorize(install.user_uid)
  interaction.deferReply()

  setGuildCommands(install.guild_uid, install.new_deets.commands)
    .catch((err) => {
      sendError(err, {
        installation: install,
      })
      logger.error({
        err,
        installation_id: install.id,
      })

      return interaction.ensure("followUp", t("failed"), {
        installation_id: install.id,
        detail: "Could not reply with installation error message",
      })
    })
    .then(async () => {
      await interaction.message.delete().catch((_e) => {})

      const cmd_locale = safe_locale(locale)
      const guild_commands = guildc.sorted.get(cmd_locale)

      const command_names = guild_commands
        .filter((c) => install.new_deets.commands.includes(c.name))
        .map((c) => present(c, locale))

      const t_args = {
        commands: command_names,
      }
      await interaction.ensure("followUp", t("saved", t_args), {
        installation_id: install.id,
        detail: "Could not reply with installation success message",
      })

      install_db.finishInstallation(install.id)
    })
}
