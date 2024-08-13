const {
  SlashCommandSubcommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  italic,
  inlineCode,
} = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")
const Completers = require("../../completers/saved-completers")
const { UserSavedRolls, saved_roll_schema } = require("../../db/saved_rolls")
const { splitMessage } = require("../../util/long-reply")
const saved_roll_presenter = require("../../presenters/saved-roll-presenter")

module.exports = {
  name: "manage",
  parent: "saved",
  description: "Change or remove a saved roll",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the saved roll to manage")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const roll_name = interaction.options.getString("name")
    const roll_id = parseInt(roll_name)

    const detail = saved_rolls.detail(roll_id, roll_name)

    if (detail === undefined) {
      return interaction.reply({
        content:
          "That saved roll does not exist. Check spelling, capitalization, or choose one of the suggested rolls.",
        ephemeral: true,
      })
    }

    let manage_text = saved_roll_presenter.present(detail)
    manage_text += "What do you want to do?"

    const edit_button = new ButtonBuilder()
      .setCustomId("edit")
      .setLabel("Edit Roll")
      .setStyle(ButtonStyle.Primary)
    if (detail.incomplete) {
      edit_button.setCustomId("no-edit")
      edit_button.setLabel("Stop Editing")
    }
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel("Remove Roll")
      .setStyle(ButtonStyle.Danger)
    const manage_actions = new ActionRowBuilder().addComponents(
      edit_button,
      cancel_button,
      remove_button,
    )
    const manage_prompt = await interaction.reply({
      content: manage_text,
      components: [manage_actions],
      ephemeral: true,
    })

    const manageHandler = async (event) => {
      switch (event.customId) {
        case "edit":
          try {
            saved_rolls.update(detail.id, { incomplete: true })
          } catch (err) {
            return manage_prompt.edit({
              content: oneLine`
                You already have an incomplete roll in progress. Finish that first using
                ${inlineCode("/saved set")} for the name and description, or right click/long press on the
                result of a Roll It command and choose ${italic("Apps -> Save this roll")} to save that
                command. Then you can edit ${italic(detail.name)}.
              `,
              components: [],
              ephemeral: true,
            })
          }

          return manage_prompt.edit({
            content: oneLine`
              The roll ${italic(detail.name)} is ready for editing. Use ${inlineCode("/saved set")} or
              ${italic("Apps -> Save this roll")} to make the changes you want!
            `,
            components: [],
            ephemeral: true,
          })
        case "no-edit":
          const command = require("../index").get(detail.command)
          try {
            await command.schema.validateAsync(detail.options)
            await saved_roll_schema.validateAsync(detail)
          } catch (err) {
            saved_rolls.update(detail.id, { incomplete: false, invalid: true })

            const edit_lines = [
              `The roll ${italic(detail.name)} is no longer marked for editing, but it has some errors:`,
              err.message,
              "You will need to fix them before you can use the roll.",
            ]

            return manage_prompt.edit({
              content: edit_lines.join("\n"),
              components: [],
              ephemeral: true,
            })
          }

          saved_rolls.update(detail.id, { incomplete: false, invalid: false })

          return manage_prompt.edit({
            content: `The roll ${italic(detail.name)} is no longer marked for editing.`,
            components: [],
            ephemeral: true,
          })
        case "remove":
          const remove_cancel = new ButtonBuilder()
            .setCustomId("remove_cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
          const remove_confirm = new ButtonBuilder()
            .setCustomId("remove_confirm")
            .setLabel("Remove")
            .setStyle(ButtonStyle.Danger)
          const remove_actions = new ActionRowBuilder().addComponents(remove_cancel, remove_confirm)
          const remove_chicken = await manage_prompt.edit({
            content: `Are you sure you want to remove the roll ${italic(detail.name)}? This action is permanent.`,
            components: [remove_actions],
            ephemeral: true,
          })

          remove_chicken
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 60_000,
            })
            .then((remove_event) => {
              remove_event.deferUpdate()
              if (remove_event.customId == "remove_cancel") {
                manage_prompt.edit({ content: "Cancelled!", components: [], ephemeral: true })
                return interaction
              }

              saved_rolls.destroy(detail.id)

              return manage_prompt.edit({
                content: `The roll ${italic(detail.name)} has been removed.`,
                components: [],
                ephemeral: true,
              })
            })
            .catch((err) => {
              manage_prompt.delete()
              return interaction
            })
          break
        case "cancel":
        default:
          manage_prompt.delete()
          return interaction
      }
    }

    return manage_prompt
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60_000,
      })
      .then((event) => {
        event.deferUpdate()
        return manageHandler(event)
      }, manageHandler)
  },
  async autocomplete(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value

    switch (focusedOption.name) {
      case "name":
        return Completers.saved_roll(partialText, saved_rolls.all())
    }
  },
  help({ command_name }) {
    return [
      `${command_name} lets you change the details about a saved roll, or remove it entirely.`,
      "",
      oneLine`
        Just like saving a new roll, you can leave the edit process and come back later. However, you can only
        have one unfinished roll at a time. That can either be a roll you just created, or a roll you are
        editing. Until you finish that roll's options, you will not be able to use it, nor will you be able to
        edit or create another saved roll.`,
      "",
      oneLine`
        Removing a saved roll is permanent. The only way to get it back is to save a new roll with the same
        name and options.
      `,
    ].join("\n")
  },
}
