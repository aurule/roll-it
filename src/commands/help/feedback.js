import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { all as suggestCommands } from "../../completers/command-completers.js"
import { UserBans } from "../../db/bans.js"
import { Feedback } from "../../db/feedback.js"
import { i18n } from "../../locales/index.js"

const command_name = "feedback"
const parent_name = "help"

module.exports = {
  name: command_name,
  parent: parent_name,
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
        return suggestCommands(partialText)
    }
  },
}
