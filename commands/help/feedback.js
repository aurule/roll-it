const { SlashCommandSubcommandBuilder, inlineCode, subtext, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const Completers = require("../../completers/command-completers")
const { UserBans } = require("../../db/bans")
const { Feedback } = require("../../db/feedback")
const { i18n } = require("../../locales")

module.exports = {
  name: "feedback",
  parent: "help",
  description: i18n.t("commands:help.feedback.description"),
  data() {
    return new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("The feedback message you want to send")
          .setMaxLength(1500)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("command")
          .setDescription("The command your feedback is about, if applicable")
          .setAutocomplete(true),
      )
      .addStringOption((option) =>
        option
          .setName("consent")
          .setDescription("May the creator of Roll It DM you about this feedback? Defaults to no.")
          .setChoices(
            { name: "Yes, you may DM me", value: "yes" },
            { name: "No, please do not DM me", value: "no" },
          ),
      )
  },
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
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} is an easy way to send your thoughts about Roll It to its developer. Good things,
        bad things, unexpected things, broken things, suggestions, etc. are all welcome.
      `,
      "",
      oneLine`
        If your feedback is about a specific command, I'd appreciate it if you include the ${opts.command}
        option. This is especially true for bugs, since it helps me track them down faster.
      `,
      "",
      oneLine`
        It's rare that I'll need to reach out and chat about most feedback. If it does come up, I don't want to
        DM you out of the blue. So if you're comfortable receiving DMs from me, set ${opts.consent} to
        ${inlineCode("Yes")} so that I know it's ok. Otherwise, I will ${italic("not")} DM you about that
        piece of feedback. ${opts.consent} defaults to ${inlineCode("No")}.
      `,
      "",
      oneLine`
        It should go without saying that ${command_name} should not be used for harrassment or hate. If you
        spam it or say vile things, you'll lose access to ${command_name} for some amount of time, possibly
        forever. So please don't be a jerk!
      `,
      subtext(oneLine`
        In legal language: I reserve the right to ban any user, at my sole discretion and at any time and for
        any duration, from sending messages via ${command_name}.
      `),
    ].join("\n")
  },
}
