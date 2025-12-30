const { PermissionFlagsBits } = require("discord.js")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const api = require("../services/api")
const { Installation } = require("../db/installation")
const starting = require("../messages/installation/starting")
const systemHelpers = require("../services/system-helpers")
const featureHelpers = require("../services/feature-helpers")

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
    const old_commands = await api.getGuildCommands(cmd_interaction.guildId).then(res => res.map(c => c.name))
    const old_systems = systemHelpers.findByCommands(...old_commands)
    const old_features = featureHelpers.findByCommands(...old_commands)

    const install_db = new Installation()
    const install_id = install_db.addInstallation({
      locale: cmd_interaction.locale,
      guild_uid: cmd_interaction.guildId,
      user_uid: cmd_interaction.user.id,
      state: "starting",
      old_deets: {
        commands: old_commands,
        systems: old_systems,
        features: old_features,
      }
    }).lastInsertRowid

    const message = starting.data(install_id)
    return cmd_interaction.ensure("reply", message)
  },
  help_data(opts) {
    const commands = require("./index")
    const guild_commands = commands.sorted.guild.get(opts.locale)
    const global_commands = commands.sorted.global.get(opts.locale)
    return {
      deployables: CommandNamePresenter.list(guild_commands, opts.locale),
      globals: CommandNamePresenter.list(global_commands, opts.locale),
    }
  },
}
