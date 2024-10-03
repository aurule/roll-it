const { SlashCommandSubcommandBuilder, inlineCode } = require("discord.js")
const Completers = require("../../completers/command-completers")
const { UserBans } = require("../../db/bans")
const { Feedback } = require("../../db/feedback")

module.exports = {
  name: "feedback",
  parent: "help",
  description: "Send feedback to Roll It's creator",
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
    const bans = new UserBans(interaction.user.id)
    if (bans.is_banned()) {
      return
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

    return interaction.whisper("Thank you! Your feedback has been recorded.")
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "command":
        return Completers.all(partialText)
    }
  },
  help(command_name, ...opts) {
    return [
      `${command_name} is a quick way to send your thoughts about Roll It to the creator. Good things, weird
      things, broken things, suggestions, and everything else are welcome. While it isn't necessary, I'd
      appreciate it if you add the ${opts.command} your feedback is about when possible, especially for bugs.
      If you're comfortable with the idea of receiving DMs from me, set ${opts.consent} to ${inlineCode("Yes")}
      so that I know it's ok. I probably won't need to reach out, but it's good to know whether I have your
      consent in case I need more details.`,
    ].join("\n")
  },
}
