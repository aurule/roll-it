const { PermissionFlagsBits } = require("discord.js")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const api = require("../services/api")
const { Installation } = require("../db/installation")
const starting = require("../messages/installation/starting")
const systemHelpers = require("../services/system-helpers")
const featureHelpers = require("../services/feature-helpers")
const { safe_locale } = require("../locales/helpers")

const command_name = "setup-roll-it"

module.exports = {
  name: command_name,
  global: true,
  data() {
    return new LocalizedSlashCommandBuilder(command_name)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  },
  async execute(cmd_interaction) {
    const old_commands = await api
      .getGuildCommands(cmd_interaction.guildId)
      .then((res) => res.map((c) => c.name))
    const old_systems = systemHelpers.findByCommands(...old_commands).map((s) => s.name)
    const old_features = featureHelpers.findByCommands(...old_commands).map((f) => f.name)

    const install_db = new Installation()
    const installation_id = install_db.addInstallation({
      locale: cmd_interaction.locale,
      guild_uid: cmd_interaction.guildId,
      user_uid: cmd_interaction.user.id,
      old_deets: {
        commands: old_commands,
        systems: old_systems,
        features: old_features,
      },
    }).lastInsertRowid

    const message = starting.data(installation_id)
    await cmd_interaction
      .ensure("reply", message, {
        installation_id,
        detail: "failed to send install start prompt",
      })
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        install_db.addMessage({
          installation_id,
          message_uid,
        })
      })
  },
  help_data(opts) {
    const commands = require("./index")

    const cmd_locale = safe_locale(opts.locale)
    const guild_commands = commands.sorted.guild.get(cmd_locale)
    const global_commands = commands.sorted.global.get(cmd_locale)
    return {
      deployables: CommandNamePresenter.list(guild_commands, opts.locale),
      globals: CommandNamePresenter.list(global_commands, opts.locale),
    }
  },
}
