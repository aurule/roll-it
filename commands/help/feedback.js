const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const Completers = require("../../completers/command-completers")
const { UserBans } = require("../../db/bans")
const { Feedback } = require("../../db/feedback")
const { i18n } = require("../../locales")
const { canonical, mapped } = require("../../locales/helpers")

const command_name = "feedback"
const parent_name = "help"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedStringOption("message", (option) => option.setMaxLength(1500).setRequired(true))
      .addLocalizedStringOption("command", (option) => option.setAutocomplete(true))
      .addLocalizedStringOption("consent", (option) => option.setLocalizedChoices("yes", "no")),
  execute(interaction) {
    const t = i18n.getFixedT(interaction.locale, "commands", "help.feedback")

    const bans = new UserBans(interaction.user.id)
    if (bans.is_banned()) {
      return interaction.whisper(t("response.banned"))
    }

    const message = interaction.options.getString("message") ?? ""
    const command_name = interaction.options.getString("command") ?? ""
    const consent = interaction.options.getString("consent") ?? "no"

    const feedback = new Feedback()
    feedback.create({
      userId: interaction.user.id,
      content: message,
      guildId: interaction.guildId,
      commandName: command_name,
      canReply: consent === "yes",
      locale: interaction.locale,
    })

    return interaction.whisper(t("response.success"))
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "command":
        return Completers.all(partialText)
    }
  },
}
