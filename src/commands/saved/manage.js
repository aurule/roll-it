import { ButtonBuilder, ButtonStyle, ComponentType } from "discord.js"

import { saved_roll as suggestSavedRoll } from "../../completers/saved-roll-completers.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"
import { present } from "../../presenters/saved-roll-presenter.js"
import rollCache from "../../services/roll-cache.js"
import { SavedRollModal } from "../../modals/saved-roll.js"
import * as build from "../../util/message-builders.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"
import { savable } from "../index.js"

/**
 * Class for the save manage command
 */
export const Manage = Child(BaseManage, "saved")

/**
 * Base class for the save manage command
 */
class BaseManage extends Command {
  static name = "manage"

  static secret = true

  rolls_db
  saved_roll
  name = ""

  static data() {
    return this.builder.addLocalizedStringOption(
      "name",
      (option) => option.setRequired(true).setAutocomplete(true),
    )
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("name")

    this.rolls_db = new UserSavedRolls(this.interaction.guildId, this.interaction.user.id)
    const roll_id = parseInt(this.name)
    this.saved_roll = this.rolls_db.detail(roll_id, this.name)
  }

  async execute() {
    if (this.saved_roll === undefined) {
      return this.interaction.whisper(this.t("options.name.validation.missing"))
    }

    let manage_text = present(this.saved_roll, this.locale)
    manage_text += "\n\n"
    manage_text += t("state.initial.prompt")

    const edit_button = new ButtonBuilder()
      .setCustomId("edit")
      .setLabel(t("state.initial.buttons.edit"))
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(t("state.initial.buttons.cancel"))
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel(t("state.initial.buttons.remove"))
      .setStyle(ButtonStyle.Danger)

    const prompt_components = [
      build.text(manage_text),
      build.actions(edit_button, cancel_button, remove_button),
    ]
    const manage_prompt = await this.interaction.reply(
      build.message(prompt_components, { secret: this.secret }),
    )

    const manageHandler = async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "edit":
          await rollCache.set(this.interaction, this.saved_roll)

          const command = savable.get(this.saved_roll.command)

          const modal = SavedRollModal.data("edit", this.locale, {
            name: this.saved_roll.name,
            description: this.saved_roll.description,
            saved: this.saved_roll,
            changeable: command.changeable,
          })
          await comp_interaction.showModal(modal)
          return comp_interaction.editReply(build.textMessage(t("state.edit.response")))
        case "remove":
          const remove_cancel = new ButtonBuilder()
            .setCustomId("remove_cancel")
            .setLabel(this.t("state.remove.buttons.cancel"))
            .setStyle(ButtonStyle.Secondary)
          const remove_confirm = new ButtonBuilder()
            .setCustomId("remove_confirm")
            .setLabel(this.t("state.remove.buttons.confirm"))
            .setStyle(ButtonStyle.Danger)

          const remove_components = [
            build.text(this.t("state.remove.prompt", { name: this.saved_roll.name })),
            build.actions(remove_cancel, remove_confirm),
          ]
          const remove_chicken = await manage_prompt.edit(
            build.message(remove_components, { secret: this.secret }),
          )

          remove_chicken
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 60_000,
            })
            .then((remove_interaction) => {
              remove_interaction.deferUpdate()
              if (remove_interaction.customId == "remove_cancel") {
                manage_prompt.edit(
                  build.textMessage(this.t("state.remove.response.cancel"), { secret: this.secret }),
                )
                return this.interaction
              }

              this.rolls_db.destroy(this.saved_roll.id)

              return manage_prompt.edit(
                build.textMessage(this.t("state.remove.response.success", { name: this.saved_roll.name }), {
                  secret: this.secret,
                }),
              )
            })
            .catch(() => {
              manage_prompt.delete()
              return this.interaction
            })
          break
        case "cancel":
        default:
          manage_prompt.delete()
          return this.interaction
      }
    }

    const collector = manage_prompt.createMessageComponentCollector({
      time: 60_000,
    })
    collector.once("collect", manageHandler)
    collector.once("end", (_, reason) => {
      if (reason === "time") {
        return this.interaction.editReply(build.textMessage(this.t("response.timeout")))
      }
    })
  }

  async autocomplete() {
    const all_rolls = this.rolls_db.all()
    const focusedOption = this.interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "name":
        return suggestSavedRoll(partialText, all_rolls)
    }
  }
}
