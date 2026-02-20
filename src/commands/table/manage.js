import {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  MessageFlags,
} from "discord.js"

import { table as suggestTables } from "../../completers/table-completers.js"
import { GuildRollables } from "../../db/rollable.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the table manage command
 */
class BaseManage extends Command {
  static name = "manage"

  table = ""
  table_id = 0
  table_db

  static data() {
    return this.builder.addLocalizedStringOption(
      "table",
      (option) => option.setRequired(true).setAutocomplete(true),
    )
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("table")

    this.table_db = new GuildRollables(interaction.guildId)
    this.table_id = parseInt(this.table)
  }

  async execute() {
    if (!this.table_db.has(this.table_id, this.table)) {
      return this.interaction.whisper(this.t("options.table.validation.missing"))
    }

    const detail = this.table_db.detail(this.table_id, this.table)

    const show_button = new ButtonBuilder()
      .setCustomId("show")
      .setLabel(this.t("state.initial.buttons.show"))
      .setStyle(ButtonStyle.Primary)
    const cancel_button = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(this.t("state.initial.buttons.cancel"))
      .setStyle(ButtonStyle.Secondary)
    const remove_button = new ButtonBuilder()
      .setCustomId("remove")
      .setLabel(this.t("state.initial.buttons.remove"))
      .setStyle(ButtonStyle.Danger)
    const manage_actions = new ActionRowBuilder().addComponents(
      show_button,
      cancel_button,
      remove_button,
    )
    const manage_prompt = await this.interaction.reply({
      content: [this.t("state.initial.details", { table: detail }), this.t("state.initial.prompt")].join(
        "\n",
      ),
      components: [manage_actions],
      flags: MessageFlags.Ephemeral,
    })

    const manageHandler = async (comp_interaction) => {
      switch (comp_interaction.customId) {
        case "show":
          await manage_prompt.delete()
          const full_text = this.t("state.show.response.success", {
            name: detail.name,
            contents: detail.contents,
          })

          return this.interaction.paginate({
            content: full_text,
            secret: true,
          })
        case "remove":
          const remove_cancel = new ButtonBuilder()
            .setCustomId("remove_cancel")
            .setLabel(this.t("state.remove.buttons.cancel"))
            .setStyle(ButtonStyle.Secondary)
          const remove_confirm = new ButtonBuilder()
            .setCustomId("remove_confirm")
            .setLabel(this.t("state.remove.buttons.confirm"))
            .setStyle(ButtonStyle.Danger)
          const remove_actions = new ActionRowBuilder().addComponents(remove_cancel, remove_confirm)
          const remove_chicken = await manage_prompt.edit({
            content: this.t("state.remove.prompt", { name: detail.name }),
            components: [remove_actions],
            flags: MessageFlags.Ephemeral,
          })

          remove_chicken
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              time: 60_000,
            })
            .then((remove_event) => {
              remove_event.deferUpdate()
              if (remove_event.customId == "remove_cancel") {
                manage_prompt.edit({
                  content: this.t("state.remove.response.cancel"),
                  components: [],
                  flags: MessageFlags.Ephemeral,
                })
                return this.interaction
              }

              this.table_db.destroy(detail.id)

              return manage_prompt.edit({
                content: this.t("state.remove.response.success", { name: detail.name }),
                components: [],
                flags: MessageFlags.Ephemeral,
              })
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
        return this.interaction.editReply({
          content: this.t("response.timeout"),
          components: [],
        })
      }
    })
  }

  async autocomplete() {
    const focusedOption = this.interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "table":
        return suggestTables(partialText, this.table_db.all())
    }
  }
}

/**
 * Class for the table manage command
 */
export const Manage = Child(BaseManage, "table")
