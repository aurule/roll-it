import { StringSelectMenuBuilder } from "discord.js"

import { i18n } from "../locales/index.js"
import { systemOptions } from "../presenters/system-options-presenter.js"
import { systems } from "../data/systems.js"
import { features } from "../data/features.js"
import * as build from "../util/modal-builders.js"
import { featureOptions } from "../presenters/feature-options-presenter.js"
import { Installation } from "../db/installation.js"
import changesMessage from "../messages/installation/changes.js"
import { Modal } from "./modal.js"

/**
 * Tiny helper to test if two sets are equal
 * @param   {Set}     s1 First set
 * @param   {Set}     s2 Second set
 * @returns {boolean}    True if the two sets have matching elements, false if not.
 */
export function setMatch(s1, s2) {
  return s1.isSupersetOf(s2) && s1.difference(s2).size === 0
}

/**
 * Modal for changing a server's installed systems and features
 */
export class ChangeInstalledModal extends Modal {
  /**
   * Database object
   * @type Installation
   */
  db

  /**
   * Associated installation record
   * @type object
   */
  installation

  static name = "change-installed"

  /**
   * Create the modal's data
   * @param  {Installation} installation Installation record
   * @return {ModalBuilder}              Modal data object
   */
  static data(installation) {
    const t = i18n.getFixedT(installation.locale, "install", "change-installed")

    const source = installation.new_deets.commands ? installation.new_deets : installation.old_deets

    const systemSelect = new StringSelectMenuBuilder({
      custom_id: "systems",
      placeholder: t("systems.placeholder"),
      options: systemOptions(installation.locale, source.systems),
      max_values: systems.size,
      required: false,
    })

    const featureSelect = new StringSelectMenuBuilder({
      custom_id: "features",
      placeholder: t("features.placeholder"),
      options: featureOptions(installation.locale, source.features),
      max_values: features.size,
      required: false,
    })

    const prompt_args = {
      context: installation.new_deets.commands ? "selected" : "installed",
    }
    const components = [
      build.text(t("prompt", prompt_args)),
      build.label(systemSelect, t("systems.label"), t("systems.description")),
      build.label(featureSelect, t("features.label")),
      build.text(t("afterward")),
    ]

    return build.modal(`${ChangeInstalledModal.name}_${installation.id}`, t("title"), components)
  }

  constructor(modal_interaction, installation_id) {
    super(modal_interaction, installation_id)
    this.db = new Installation()
    this.installation = this.db.getInstallation(this.id)
  }

  /**
   * Submit the modal
   *
   * @return {Promise} Submission promise, usually a Message
   */
  async submit() {
    const new_deets = {
      systems: this.getStringSelectValues("systems"),
      features: this.getStringSelectValues("features"),
    }

    const new_commands = new Set()
    for (const system_name of new_deets.systems) {
      const system = systems.get(system_name)
      for (const c of system.commands.required) {
        new_commands.add(c)
      }
      if (system.commands.recommended) {
        for (const c of system.commands.recommended) {
          new_commands.add(c)
        }
      }
    }

    for (const feature_name of new_deets.features) {
      const feature = features.get(feature_name)
      for (const c of feature.commands) {
        new_commands.add(c)
      }
    }

    new_deets.commands = Array.from(new_commands)

    // Skip the changes message if there are no differences
    if (
      setMatch(new Set(this.installation.old_deets.systems), new Set(new_deets.systems)) &&
      setMatch(new Set(this.installation.old_deets.features), new Set(new_deets.features)) &&
      setMatch(new Set(this.installation.old_deets.systems), new_commands)
    ) {
      return this.deferUpdate()
    }

    // update and show changes
    this.db.setNewDeets(this.id, new_deets)
    modal_interaction.message.delete().catch((_e) => {})
    return modal_interaction
      .ensure("reply", changesMessage.data(this.id), {
        installation_id: this.id,
        detail: "Failed to send install changes message",
      })
      .then((reply_result) => {
        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        this.db.addMessage({
          installation_id: this.id,
          message_uid,
        })
      })
  }
}
