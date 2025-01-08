const { SlashCommandBuilder, hideLinkEmbed, hyperlink } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/fate-results-presenter")
const { fudge } = require("../services/tally")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")

module.exports = {
  name: "fate",
  description: "Make a FATE roll of four fudge dice",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("modifier")
          .setDescription("A number to add to the result after adding up the rolled dice"),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    rolls: commonSchemas.rolls,
    modifier: commonSchemas.modifier,
    description: commonSchemas.description,
  }),
  perform({ rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
    const raw_results = roll(4, 3, rolls)
    const summed_results = fudge(raw_results)

    return present({
      rolls,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      description: roll_description,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return oneLine`
      ${command_name} rolls four fudge dice whose sides are -1, 0, and +1, then adds them up. The result is
      displayed using the FATE
      ${hyperlink(
        "ladder",
        hideLinkEmbed("https://fate-srd.com/fate-core/taking-action-dice-ladder#the-ladder"),
      )}.
    `
  },
}
