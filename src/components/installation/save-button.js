const { ButtonBuilder, ButtonStyle } = require("discord.js")
const { i18n } = require("../../locales")
const { Installation } = require("../../db/installation")
const api = require("../../services/api")
const { logger } = require("../../util/logger")
const { present } = require("../../presenters/command-name-presenter")
const { safe_locale } = require("../../locales/helpers")

/**
 * Button to save changes to installed commands
 */
module.exports = {
  name: "install_save",
  data: (locale) => {
    const t = i18n.getFixedT(locale, "install", "shared.components.save")
    return new ButtonBuilder()
      .setCustomId("install_save")
      .setLabel(t("text"))
      .setStyle(ButtonStyle.Primary)
  },
  async execute(interaction) {
    const install_db = new Installation()
    const install = install_db.findInstallationByMessage(interaction.message.id)
    const locale = install.locale
    const t = i18n.getFixedT(locale, "install")

    interaction.authorize(install.user_uid)

    api
      .setGuildCommands(install.guild_uid, install.new_deets.commands)
      .catch((err) => {
        logger.error({
          err,
          installation_id: install.id,
        })

        return interaction.ensure("reply", t("failed"), {
          installation_id: install.id,
          detail: "Could not reply with installation error message",
        })
      })
      .then(async () => {
        await interaction.message.delete().catch((_e) => {})

        const commands = require("../../commands")
        const cmd_locale = safe_locale(locale)
        const guild_commands = commands.sorted.guild.get(cmd_locale)

        const command_names = guild_commands
          .filter((c) => install.new_deets.commands.includes(c.name))
          .map((c) => present(c, locale))

        const t_args = {
          commands: command_names,
        }
        await interaction.ensure("reply", t("saved", t_args), {
          installation_id: install.id,
          detail: "Could not reply with installation success message",
        })

        install_db.finishInstallation(install.id)
      })
  },
}
