import { PermissionFlagsBits } from "discord.js"

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const api = require("../services/api")
const { Installation } = require("../db/installation")
const starting = require("../messages/installation/starting")
const systemHelpers = require("../services/system-helpers")
const featureHelpers = require("../services/feature-helpers")
const { safe_locale } = require("../locales/helpers")
import { features } from "../data/features.js"
import { systems } from "../data/systems.js"
const { i18n } = require("../locales")
const { present } = require("../presenters/command-name-presenter")

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
    const locale = opts.locale
    const cmd_locale = safe_locale(locale)
    const guild_commands = commands.sorted.guild.get(cmd_locale)
    const global_commands = commands.sorted.global.get(cmd_locale)

    const data_t = i18n.getFixedT(locale, "translation")
    const cmd_t = i18n.getFixedT(locale, "commands", "setup-roll-it")

    const systems_list = systems_list.map((sys) => {
      const sys_commands = new Set(sys.commands.required)
      if (sys.commands.recommended) {
        for (const c of sys.commands.recommended) {
          sys_commands.add(c)
        }
      }

      const t_args = {
        title: data_t(`systems.${sys.name}.title`),
        commands: guild_commands
          .filter((c) => sys_commands.has(c.name))
          .map((c) => present(c, locale)),
      }
      return cmd_t("feature", t_args)
    })

    const features_list = features_list.map((feat) => {
      const feat_commands = new Set(feat.commands)

      const t_args = {
        title: data_t(`features.${feat.name}.title`),
        commands: guild_commands
          .filter((c) => feat_commands.has(c.name))
          .map((c) => present(c, locale)),
      }
      return cmd_t("feature", t_args)
    })

    return {
      globals: CommandNamePresenter.list(global_commands, locale),
      systems: systems_list,
      features: features_list,
    }
  },
}
